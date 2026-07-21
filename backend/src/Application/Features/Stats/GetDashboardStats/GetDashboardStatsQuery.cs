using MediatR;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Stats.GetDashboardStats;

/// <summary>
/// FromDate/ToDate are only honored when the tenant's plan includes FeatureKeys.AdvancedDashboard
/// (Pro) — otherwise the handler silently falls back to the Fase 6 default (this month / last 30
/// days), so Intermedio tenants keep the exact behavior they already had.
/// </summary>
public record GetDashboardStatsQuery(DateOnly? FromDate = null, DateOnly? ToDate = null)
    : IRequest<DashboardStatsDto>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Stats;
}

public record AppointmentStatusCountDto(string Status, int Count);

public record ServiceCountDto(string ServiceName, int Count);

public record DailyCashFlowDto(DateOnly Date, decimal Income, decimal Expense);

public record DashboardStatsDto(
    int TotalClients,
    int NewClientsInRange,
    int AppointmentsCompletedInRange,
    int LowStockProductsCount,
    decimal NetCashInRange,
    bool IsCustomRange,
    IReadOnlyList<AppointmentStatusCountDto> AppointmentsByStatus,
    IReadOnlyList<ServiceCountDto> TopServices,
    IReadOnlyList<DailyCashFlowDto> CashFlowByDay);
