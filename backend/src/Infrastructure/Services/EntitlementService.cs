using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Infrastructure.Identity;
using PeluqueriaSaas.Infrastructure.Persistence;

namespace PeluqueriaSaas.Infrastructure.Services;

public class EntitlementService(ApplicationDbContext db) : IEntitlementService
{
    public async Task<bool> HasFeatureAsync(Guid tenantId, string featureKey, CancellationToken cancellationToken = default)
    {
        var planId = await CurrentPlanIdAsync(tenantId, cancellationToken);
        if (planId is null)
        {
            return false;
        }

        return await db.PlanFeatures.AnyAsync(f => f.PlanId == planId && f.FeatureKey == featureKey, cancellationToken);
    }

    public async Task<bool> CanAddEmployeeAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var planId = await CurrentPlanIdAsync(tenantId, cancellationToken);
        if (planId is null)
        {
            return false;
        }

        var maxEmployees = await db.Plans
            .Where(p => p.Id == planId)
            .Select(p => p.MaxEmployees)
            .FirstOrDefaultAsync(cancellationToken);

        if (maxEmployees is null)
        {
            return true; // ilimitado (Plan Pro)
        }

        var currentEmployeeCount = await db.Users.CountAsync(u => u.TenantId == tenantId, cancellationToken);
        return currentEmployeeCount < maxEmployees;
    }

    private async Task<Guid?> CurrentPlanIdAsync(Guid tenantId, CancellationToken cancellationToken) =>
        await db.Subscriptions
            .Where(s => s.TenantId == tenantId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => (Guid?)s.PlanId)
            .FirstOrDefaultAsync(cancellationToken);
}
