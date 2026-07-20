using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Plans.ListPlans;

public class ListPlansQueryHandler(IApplicationDbContext db) : IRequestHandler<ListPlansQuery, IReadOnlyList<PlanDto>>
{
    public async Task<IReadOnlyList<PlanDto>> Handle(ListPlansQuery request, CancellationToken cancellationToken)
    {
        var plans = await db.Plans
            .Where(p => p.IsActive)
            .OrderBy(p => p.PriceUsd)
            .Select(p => new PlanDto(
                p.Id,
                p.Code,
                p.Name,
                p.PriceUsd,
                p.MaxEmployees,
                p.Features.Select(f => f.FeatureKey).ToArray()))
            .ToListAsync(cancellationToken);

        return plans;
    }
}
