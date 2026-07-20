using MediatR;

namespace PeluqueriaSaas.Application.Features.Tenants.GetMyTenant;

public record GetMyTenantQuery : IRequest<MyTenantDto>;

public record MyTenantDto(
    Guid TenantId,
    string Name,
    string PublicFormSlug,
    string PlanCode,
    string PlanName,
    decimal PlanPriceUsd,
    int? MaxEmployees,
    int EmployeeCount,
    string SubscriptionStatus,
    DateTime StartedAt,
    DateTime CurrentPeriodEnd,
    string[] Features);
