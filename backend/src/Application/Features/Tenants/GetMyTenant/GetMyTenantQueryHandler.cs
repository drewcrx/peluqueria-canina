using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Tenants.GetMyTenant;

public class GetMyTenantQueryHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetMyTenantQuery, MyTenantDto>
{
    public async Task<MyTenantDto> Handle(GetMyTenantQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.TenantId
            ?? throw new AuthenticationException("Esta operación requiere una sesión de peluquería.");

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

        return new MyTenantDto(
            tenant.Id,
            tenant.Name,
            tenant.PublicFormSlug,
            plan.Code,
            plan.Name,
            subscription.Status.ToString(),
            subscription.CurrentPeriodEnd,
            features);
    }
}
