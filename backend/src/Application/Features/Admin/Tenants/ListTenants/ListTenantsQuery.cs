using MediatR;

namespace PeluqueriaSaas.Application.Features.Admin.Tenants.ListTenants;

public record ListTenantsQuery : IRequest<IReadOnlyList<TenantSummaryDto>>;

public record TenantSummaryDto(
    Guid TenantId,
    string Name,
    string Status,
    string PlanCode,
    string SubscriptionStatus,
    DateTime CurrentPeriodEnd,
    DateTime CreatedAt);
