using MediatR;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Stats.GetDashboardStats;

public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Stats;
}

public record AppointmentStatusCountDto(string Status, int Count);

public record ServiceCountDto(string ServiceName, int Count);

public record DailyCashFlowDto(DateOnly Date, decimal Income, decimal Expense);

public record DashboardStatsDto(
    int TotalClients,
    int NewClientsThisMonth,
    int AppointmentsCompletedThisMonth,
    int LowStockProductsCount,
    decimal NetCashThisMonth,
    IReadOnlyList<AppointmentStatusCountDto> AppointmentsByStatus,
    IReadOnlyList<ServiceCountDto> TopServices,
    IReadOnlyList<DailyCashFlowDto> CashFlowLast30Days);
