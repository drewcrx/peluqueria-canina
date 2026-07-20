using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Admin.Tenants.GetTenantDetail;

public class GetTenantDetailQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetTenantDetailQuery, TenantDetailDto>
{
    public async Task<TenantDetailDto> Handle(GetTenantDetailQuery request, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        var subscription = await db.Subscriptions
            .Where(s => s.TenantId == tenant.Id)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        string? planCode = null;
        if (subscription is not null)
        {
            planCode = await db.Plans
                .Where(p => p.Id == subscription.PlanId)
                .Select(p => p.Code)
                .FirstOrDefaultAsync(cancellationToken);
        }

        return new TenantDetailDto(
            tenant.Id,
            tenant.Name,
            tenant.PublicFormSlug,
            tenant.Status.ToString(),
            tenant.CreatedAt,
            subscription?.Id,
            planCode,
            subscription?.Status.ToString(),
            subscription?.CurrentPeriodEnd);
    }
}
