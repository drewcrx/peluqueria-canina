using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
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
    options.AddPolicy(frontendCorsPolicy, policy => policy
        .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:5173"])
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
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(RateLimiterPolicies.PublicForm, opt =>
    {
        opt.Window = TimeSpan.FromMinutes(1);
        opt.PermitLimit = 5;
        opt.QueueLimit = 0;
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    await DbInitializer.SeedAsync(scope.ServiceProvider, app.Environment.IsDevelopment());
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

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

// Sirve fotos/firmas guardadas por LocalFileStorage. Carpeta fuera de wwwroot, expuesta solo
// bajo el prefijo /uploads.
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "App_Data", "uploads");
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseRateLimiter();

app.UseAuthentication();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();
