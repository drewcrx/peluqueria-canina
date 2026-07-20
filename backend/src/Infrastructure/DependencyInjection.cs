using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Infrastructure.Identity;
using PeluqueriaSaas.Infrastructure.Multitenancy;
using PeluqueriaSaas.Infrastructure.Persistence;
using PeluqueriaSaas.Infrastructure.Services;

namespace PeluqueriaSaas.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        // AddIdentityCore (no AddIdentity): Infrastructure es una librería de clases pura, sin el
        // framework compartido de ASP.NET Core, así que no tiene acceso al AddIdentity "completo"
        // (que además registra autenticación por cookies que no usamos — la sesión va por JWT).
        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequireDigit = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 8;
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<ApplicationDbContext>();
            // AddDefaultTokenProviders() vive en el framework compartido de ASP.NET Core (no
            // disponible en una librería de clases) y no hace falta todavía: no hay flujo de
            // "olvidé mi contraseña" ni confirmación de email en esta fase. Se añade cuando exista.

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        services.AddScoped<TenantContext>();
        services.AddScoped<ITenantContext>(sp => sp.GetRequiredService<TenantContext>());

        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IEntitlementService, EntitlementService>();

        return services;
    }
}
