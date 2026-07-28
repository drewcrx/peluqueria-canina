using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using PeluqueriaSaas.Api;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Api.Middleware;
using PeluqueriaSaas.Application;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Infrastructure;
using PeluqueriaSaas.Infrastructure.Persistence;
using PeluqueriaSaas.Infrastructure.Persistence.Seed;
using PeluqueriaSaas.Infrastructure.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

const string frontendCorsPolicy = "Frontend";

builder.Host.UseSerilog((context, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .WriteTo.Console());

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddCors(options =>
{
    // https://localhost y capacitor://localhost: orígenes por defecto del WebView de la app
    // empaquetada con Capacitor (Android/iOS) — necesarios para que pueda llamar a este backend
    // aunque no se sirva desde el mismo origen que la app.
    options.AddPolicy(frontendCorsPolicy, policy => policy
        .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:5173", "https://localhost", "capacitor://localhost"])
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("Falta la sección 'Jwt' en la configuración.");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme = "TenantAuth";
        options.DefaultChallengeScheme = "TenantAuth";
    })
    // El SPA nunca manda X-Api-Key (usa la cookie), así que este scheme "router" solo desvía
    // a ApiKey cuando el header está presente — el resto del tráfico sigue igual que siempre.
    .AddPolicyScheme("TenantAuth", "JWT o API Key", options =>
    {
        options.ForwardDefaultSelector = context =>
            context.Request.Headers.ContainsKey(ApiKeyAuthenticationDefaults.HeaderName)
                ? ApiKeyAuthenticationDefaults.Scheme
                : JwtBearerDefaults.AuthenticationScheme;
    })
    .AddScheme<AuthenticationSchemeOptions, ApiKeyAuthenticationHandler>(ApiKeyAuthenticationDefaults.Scheme, _ => { })
    .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };

        // El SPA nunca toca el token (va en cookie httpOnly); Swagger/Postman siguen pudiendo
        // usar el header Authorization normal. El header, si está presente, tiene prioridad.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Request.Headers.Authorization) &&
                    context.Request.Cookies.TryGetValue(AuthCookies.AccessTokenCookie, out var cookieToken))
                {
                    context.Token = cookieToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.TenantUser, policy => policy.RequireClaim("tenant_id"));
    options.AddPolicy(AuthorizationPolicies.TenantOwner, policy => policy
        .RequireClaim("tenant_id")
        .RequireRole(RoleNames.TenantOwner));
    options.AddPolicy(AuthorizationPolicies.OwnerOrManager, policy => policy
        .RequireClaim("tenant_id")
        .RequireRole(RoleNames.TenantOwner, RoleNames.Manager));
    options.AddPolicy(AuthorizationPolicies.PlatformAdmin, policy => policy.RequireRole(RoleNames.PlatformAdmin));
});

// Protege el único endpoint público de escritura (envío del formulario) contra spam/abuso.
// Sin esto, cualquiera podría automatizar envíos masivos al slug de una peluquería.
//
// AddPolicy + RateLimitPartition (NO AddFixedWindowLimiter a secas): AddFixedWindowLimiter crea
// un único cupo GLOBAL compartido por todos los llamantes de la policy, no uno por IP — con eso,
// 5 envíos de CUALQUIER persona agotaban el cupo para TODOS los demás durante la ventana (un
// bug de denegación de servicio trivial, no la protección "contra un abusador" que dice el
// comentario). Particionar por IP hace que el límite aplique por cliente, como se pretendía.
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy(RateLimiterPolicies.PublicForm, context => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            PermitLimit = 5,
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
        }));

    // Sin esto, olvidé-mi-contraseña se puede usar para enumerar correos registrados a fuerza
    // bruta (aunque la respuesta no distinga "existe"/"no existe", el tiempo/volumen sí delata) o
    // para spamear el "envío" de correo.
    options.AddPolicy(RateLimiterPolicies.PasswordReset, context => RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            PermitLimit = 5,
            QueueLimit = 0,
            QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
        }));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    // En el VPS, Nginx hace el TLS y le pasa a Kestrel tráfico plano por localhost — sin esto,
    // Request.Scheme siempre parece "http" (rompe UseHttpsRedirection, cookies Secure, y los
    // links absolutos que arme el backend) y Request.IP siempre parece ser el propio Nginx.
    // Los defaults (solo confía en el próximo salto desde loopback) ya cubren ese setup de un
    // solo proxy en la misma máquina, así que no hace falta tocar KnownNetworks/KnownProxies.
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    await DbInitializer.SeedAsync(scope.ServiceProvider, app.Environment.IsDevelopment());
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

// Debe ir antes que cualquier middleware que dependa de Request.Scheme/RemoteIpAddress
// (UseHttpsRedirection, rate limiting por IP, logging) — por eso está primero en la tubería.
app.UseForwardedHeaders();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors(frontendCorsPolicy);

// Sirve fotos/firmas/logos guardados por LocalFileStorage. Carpeta fuera de wwwroot, expuesta
// solo bajo el prefijo /uploads.
//
// El allowlist de tipos de contenido es defensa en profundidad, no el único control: si algún
// día se cuela un archivo con una extensión fuera de esta lista (p. ej. .html) por un descuido en
// la validación de un handler de subida, ASP.NET no lo sirve igual (ServeUnknownFileTypes queda
// en su default `false`) en vez de devolverlo con un Content-Type que el navegador ejecute.
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "App_Data", "uploads");
Directory.CreateDirectory(uploadsPath);
var uploadsContentTypeProvider = new FileExtensionContentTypeProvider(new Dictionary<string, string>
{
    [".jpg"] = "image/jpeg",
    [".jpeg"] = "image/jpeg",
    [".png"] = "image/png",
    [".webp"] = "image/webp",
    [".gif"] = "image/gif",
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
    ContentTypeProvider = uploadsContentTypeProvider,
    OnPrepareResponse = ctx => ctx.Context.Response.Headers.Append("X-Content-Type-Options", "nosniff"),
});

app.UseRateLimiter();

app.UseAuthentication();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();
