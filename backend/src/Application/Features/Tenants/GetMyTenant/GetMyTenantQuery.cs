using MediatR;

namespace PeluqueriaSaas.Application.Features.Tenants.GetMyTenant;

public record GetMyTenantQuery : IRequest<MyTenantDto>;

public record MyTenantDto(
    Guid TenantId,
    string Name,
    string PublicFormSlug,
    string PlanCode,
    string PlanName,
    string SubscriptionStatus,
    DateTime CurrentPeriodEnd,
    string[] Features);
