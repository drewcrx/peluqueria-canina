using MediatR;

namespace PeluqueriaSaas.Application.Features.Plans.ListPlans;

public record ListPlansQuery : IRequest<IReadOnlyList<PlanDto>>;

public record PlanDto(Guid Id, string Code, string Name, decimal PriceUsd, int? MaxEmployees, string[] Features);
