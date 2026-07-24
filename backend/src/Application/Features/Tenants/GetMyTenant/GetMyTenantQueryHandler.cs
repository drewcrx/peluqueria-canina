using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Tenants.GetMyTenant;

public class GetMyTenantQueryHandler(IApplicationDbContext db, IIdentityService identityService, ITenantContext tenantContext)
    : IRequestHandler<GetMyTenantQuery, MyTenantDto>
{
    public async Task<MyTenantDto> Handle(GetMyTenantQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();

        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        // Subscriptions ya viene filtrado por el tenant actual gracias al filtro global.
        var subscription = await db.Subscriptions
            .Where(s => s.TenantId == tenantId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Esta peluquería no tiene una suscripción activa.");

        var plan = await db.Plans.FirstOrDefaultAsync(p => p.Id == subscription.PlanId, cancellationToken)
            ?? throw new NotFoundException("El plan de esta suscripción ya no existe.");

        var features = await db.PlanFeatures
            .Where(f => f.PlanId == plan.Id)
            .Select(f => f.FeatureKey)
            .ToArrayAsync(cancellationToken);

        var employees = await identityService.ListByTenantAsync(tenantId, cancellationToken);

        return new MyTenantDto(
            tenant.Id,
            tenant.Name,
            tenant.PublicFormSlug,
            plan.Code,
            plan.Name,
            plan.PriceUsd,
            plan.MaxEmployees,
            employees.Count,
            subscription.Status.ToString(),
            subscription.StartedAt,
            subscription.CurrentPeriodEnd,
            features,
            tenant.WhatsAppNumber,
            tenant.CustomDomainRequested,
            tenant.LogoUrl,
            tenant.BrandColor);
    }
}
