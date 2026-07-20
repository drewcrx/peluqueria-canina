using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Infrastructure.Identity;

namespace PeluqueriaSaas.Infrastructure.Persistence.Seed;

/// <summary>
/// Idempotent startup seed: roles, plan catalog, and (dev-only) a Platform Admin account so
/// there's a way into /admin before any real staff account exists. Safe to run every boot.
/// </summary>
public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider services, bool isDevelopment, CancellationToken cancellationToken = default)
    {
        var db = services.GetRequiredService<ApplicationDbContext>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        await SeedRolesAsync(roleManager);
        await SeedPlansAsync(db, cancellationToken);

        if (isDevelopment)
        {
            await SeedDevPlatformAdminAsync(userManager);
        }
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
    {
        foreach (var role in new[] { RoleNames.PlatformAdmin, RoleNames.TenantOwner, RoleNames.Employee })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }
    }

    private static async Task SeedPlansAsync(ApplicationDbContext db, CancellationToken cancellationToken)
    {
        if (await db.Plans.AnyAsync(cancellationToken))
        {
            return;
        }

        var basico = Plan.Create(PlanCodes.Basico, "Básico", 10m, maxEmployees: 1);

        var intermedio = Plan.Create(PlanCodes.Intermedio, "Intermedio", 15m, maxEmployees: 5);
        foreach (var feature in new[] { FeatureKeys.Inventory, FeatureKeys.Caja, FeatureKeys.Reminders, FeatureKeys.Photos, FeatureKeys.Stats })
        {
            intermedio.AddFeature(feature);
        }

        var pro = Plan.Create(PlanCodes.Pro, "Pro", 20m, maxEmployees: null);
        foreach (var feature in new[]
        {
            FeatureKeys.Inventory, FeatureKeys.Caja, FeatureKeys.Reminders, FeatureKeys.Photos, FeatureKeys.Stats,
            FeatureKeys.AdvancedRoles, FeatureKeys.Api, FeatureKeys.AdvancedDashboard, FeatureKeys.Integrations,
            FeatureKeys.CustomDomain, FeatureKeys.WhatsApp, FeatureKeys.Invoicing, FeatureKeys.AutoBackups
        })
        {
            pro.AddFeature(feature);
        }

        db.Plans.AddRange(basico, intermedio, pro);
        await db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Dev-only seed account so the /admin panel is reachable on a fresh local database.
    /// Never runs outside Development; a real deployment creates Platform Admins by hand.
    /// </summary>
    private static async Task SeedDevPlatformAdminAsync(UserManager<ApplicationUser> userManager)
    {
        const string email = "admin@peluqueriasaas.local";

        // IgnoreQueryFilters: coincide con el mismo motivo documentado en IdentityService —
        // en este punto no hay contexto de tenant resuelto (ni tiene por qué haberlo, es un
        // seed de arranque), y el filtro de ApplicationUser no debe decidir si este admin existe.
        var exists = await userManager.Users.IgnoreQueryFilters().AnyAsync(u => u.NormalizedEmail == email.ToUpperInvariant());
        if (exists)
        {
            return;
        }

        var admin = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = "Platform Admin (dev)",
            TenantId = null,
            IsActive = true,
            EmailConfirmed = true
        };

        var result = await userManager.CreateAsync(admin, "DevAdmin#2026");
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(admin, RoleNames.PlatformAdmin);
        }
    }
}
