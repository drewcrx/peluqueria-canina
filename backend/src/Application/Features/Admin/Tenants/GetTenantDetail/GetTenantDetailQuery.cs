using MediatR;

namespace PeluqueriaSaas.Application.Features.Admin.Tenants.GetTenantDetail;

public record GetTenantDetailQuery(Guid TenantId) : IRequest<TenantDetailDto>;

public record TenantDetailDto(
    Guid TenantId,
    string Name,
    string PublicFormSlug,
    string Status,
    DateTime CreatedAt,
    Guid? SubscriptionId,
    string? PlanCode,
    string? SubscriptionStatus,
    DateTime? CurrentPeriodEnd);
