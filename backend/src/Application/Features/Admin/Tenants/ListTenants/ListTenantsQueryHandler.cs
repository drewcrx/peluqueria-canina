using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Admin.Tenants.ListTenants;

public class ListTenantsQueryHandler(IApplicationDbContext db) : IRequestHandler<ListTenantsQuery, IReadOnlyList<TenantSummaryDto>>
{
    public async Task<IReadOnlyList<TenantSummaryDto>> Handle(ListTenantsQuery request, CancellationToken cancellationToken)
    {
        var result = await db.Tenants
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                Tenant = t,
                Subscription = db.Subscriptions
                    .Where(s => s.TenantId == t.Id)
                    .OrderByDescending(s => s.CreatedAt)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        var planIds = result
            .Where(r => r.Subscription != null)
            .Select(r => r.Subscription!.PlanId)
            .Distinct()
            .ToList();

        var planCodesById = await db.Plans
            .Where(p => planIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Code, cancellationToken);

        return [.. result.Select(r => new TenantSummaryDto(
            r.Tenant.Id,
            r.Tenant.Name,
            r.Tenant.Status.ToString(),
            r.Subscription is null ? "—" : planCodesById.GetValueOrDefault(r.Subscription.PlanId, "—"),
            r.Subscription?.Status.ToString() ?? "SinSuscripción",
            r.Subscription?.CurrentPeriodEnd ?? default,
            r.Tenant.CreatedAt))];
    }
}
