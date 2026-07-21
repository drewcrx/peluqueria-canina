using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Stats.GetDashboardStats;

public class GetDashboardStatsQueryHandler(IApplicationDbContext db, IEntitlementService entitlementService, ITenantContext tenantContext)
    : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private const int MaxRangeDays = 366;

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();
        var now = DateTime.UtcNow;

        var isCustomRange = request.FromDate is not null && request.ToDate is not null
            && await entitlementService.HasFeatureAsync(tenantId, FeatureKeys.AdvancedDashboard, cancellationToken);

        DateTime periodStart;
        DateTime? periodEndExclusive;
        DateOnly chartFrom;
        DateOnly chartTo;

        if (isCustomRange)
        {
            var from = request.FromDate!.Value;
            var to = request.ToDate!.Value;
            if (to < from)
            {
                (from, to) = (to, from);
            }
            if (to.DayNumber - from.DayNumber > MaxRangeDays)
            {
                from = to.AddDays(-MaxRangeDays);
            }

            periodStart = from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            periodEndExclusive = to.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            chartFrom = from;
            chartTo = to;
        }
        else
        {
            periodStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            periodEndExclusive = null;
            chartFrom = DateOnly.FromDateTime(now.Date.AddDays(-29));
            chartTo = DateOnly.FromDateTime(now.Date);
        }

        var totalClients = await db.Clients.CountAsync(cancellationToken);

        var newClientsInRange = await db.Clients.CountAsync(
            c => c.CreatedAt >= periodStart && (periodEndExclusive == null || c.CreatedAt < periodEndExclusive), cancellationToken);

        var appointmentsCompletedInRange = await db.Appointments.CountAsync(
            a => a.Status == AppointmentStatus.Completed && a.CompletedAt >= periodStart &&
                (periodEndExclusive == null || a.CompletedAt < periodEndExclusive),
            cancellationToken);

        var lowStockProductsCount = await db.Products
            .CountAsync(p => p.IsActive && p.MinStock != null && p.StockQuantity <= p.MinStock, cancellationToken);

        var cashInRange = await db.CashTransactions
            .Where(t => t.CreatedAt >= periodStart && (periodEndExclusive == null || t.CreatedAt < periodEndExclusive))
            .GroupBy(t => t.Type)
            .Select(g => new { Type = g.Key, Total = g.Sum(t => t.Amount) })
            .ToListAsync(cancellationToken);
        var netCashInRange =
            (cashInRange.FirstOrDefault(x => x.Type == CashTransactionType.Income)?.Total ?? 0m) -
            (cashInRange.FirstOrDefault(x => x.Type == CashTransactionType.Expense)?.Total ?? 0m);

        var appointmentsByStatusQuery = db.Appointments.AsQueryable();
        if (isCustomRange)
        {
            appointmentsByStatusQuery = appointmentsByStatusQuery.Where(
                a => a.CreatedAt >= periodStart && (periodEndExclusive == null || a.CreatedAt < periodEndExclusive));
        }
        var appointmentsByStatus = await appointmentsByStatusQuery
            .GroupBy(a => a.Status)
            .Select(g => new AppointmentStatusCountDto(g.Key.ToString(), g.Count()))
            .ToListAsync(cancellationToken);

        var completedAppointmentsQuery = db.Appointments.Where(a => a.Status == AppointmentStatus.Completed);
        if (isCustomRange)
        {
            completedAppointmentsQuery = completedAppointmentsQuery.Where(
                a => a.CompletedAt >= periodStart && (periodEndExclusive == null || a.CompletedAt < periodEndExclusive));
        }
        var completedServiceNames = await db.AppointmentServices
            .Join(completedAppointmentsQuery, aps => aps.AppointmentId, a => a.Id, (aps, a) => aps.ServiceId)
            .Join(db.Services, serviceId => serviceId, s => s.Id, (serviceId, s) => s.Name)
            .ToListAsync(cancellationToken);

        var topServices = completedServiceNames
            .GroupBy(name => name)
            .Select(g => new ServiceCountDto(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToList();

        var chartDayCount = chartTo.DayNumber - chartFrom.DayNumber + 1;
        var chartStartUtc = chartFrom.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var chartEndExclusiveUtc = chartTo.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        var chartCashTransactions = await db.CashTransactions
            .Where(t => t.CreatedAt >= chartStartUtc && t.CreatedAt < chartEndExclusiveUtc)
            .Select(t => new { t.CreatedAt, t.Type, t.Amount })
            .ToListAsync(cancellationToken);

        var cashFlowByDay = Enumerable.Range(0, chartDayCount)
            .Select(offset => chartFrom.AddDays(offset))
            .Select(day => new DailyCashFlowDto(
                day,
                chartCashTransactions.Where(t => DateOnly.FromDateTime(t.CreatedAt) == day && t.Type == CashTransactionType.Income).Sum(t => t.Amount),
                chartCashTransactions.Where(t => DateOnly.FromDateTime(t.CreatedAt) == day && t.Type == CashTransactionType.Expense).Sum(t => t.Amount)))
            .ToList();

        return new DashboardStatsDto(
            totalClients,
            newClientsInRange,
            appointmentsCompletedInRange,
            lowStockProductsCount,
            netCashInRange,
            isCustomRange,
            appointmentsByStatus,
            topServices,
            cashFlowByDay);
    }
}
