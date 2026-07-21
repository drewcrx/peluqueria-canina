using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Stats.GetDashboardStats;

public class GetDashboardStatsQueryHandler(IApplicationDbContext db) : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var last30Start = now.Date.AddDays(-29);

        var totalClients = await db.Clients.CountAsync(cancellationToken);
        var newClientsThisMonth = await db.Clients.CountAsync(c => c.CreatedAt >= monthStart, cancellationToken);

        var appointmentsCompletedThisMonth = await db.Appointments
            .CountAsync(a => a.Status == AppointmentStatus.Completed && a.CompletedAt >= monthStart, cancellationToken);

        var lowStockProductsCount = await db.Products
            .CountAsync(p => p.IsActive && p.MinStock != null && p.StockQuantity <= p.MinStock, cancellationToken);

        var cashThisMonth = await db.CashTransactions
            .Where(t => t.CreatedAt >= monthStart)
            .GroupBy(t => t.Type)
            .Select(g => new { Type = g.Key, Total = g.Sum(t => t.Amount) })
            .ToListAsync(cancellationToken);
        var netCashThisMonth =
            (cashThisMonth.FirstOrDefault(x => x.Type == CashTransactionType.Income)?.Total ?? 0m) -
            (cashThisMonth.FirstOrDefault(x => x.Type == CashTransactionType.Expense)?.Total ?? 0m);

        var appointmentsByStatus = await db.Appointments
            .GroupBy(a => a.Status)
            .Select(g => new AppointmentStatusCountDto(g.Key.ToString(), g.Count()))
            .ToListAsync(cancellationToken);

        var completedServiceNames = await db.AppointmentServices
            .Join(db.Appointments, aps => aps.AppointmentId, a => a.Id, (aps, a) => new { aps.ServiceId, a.Status })
            .Where(x => x.Status == AppointmentStatus.Completed)
            .Join(db.Services, x => x.ServiceId, s => s.Id, (x, s) => s.Name)
            .ToListAsync(cancellationToken);

        var topServices = completedServiceNames
            .GroupBy(name => name)
            .Select(g => new ServiceCountDto(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .Take(5)
            .ToList();

        var recentCashTransactions = await db.CashTransactions
            .Where(t => t.CreatedAt >= last30Start)
            .Select(t => new { t.CreatedAt, t.Type, t.Amount })
            .ToListAsync(cancellationToken);

        var cashFlowLast30Days = Enumerable.Range(0, 30)
            .Select(offset => last30Start.AddDays(offset))
            .Select(day => new DailyCashFlowDto(
                DateOnly.FromDateTime(day),
                recentCashTransactions.Where(t => t.CreatedAt.Date == day && t.Type == CashTransactionType.Income).Sum(t => t.Amount),
                recentCashTransactions.Where(t => t.CreatedAt.Date == day && t.Type == CashTransactionType.Expense).Sum(t => t.Amount)))
            .ToList();

        return new DashboardStatsDto(
            totalClients,
            newClientsThisMonth,
            appointmentsCompletedThisMonth,
            lowStockProductsCount,
            netCashThisMonth,
            appointmentsByStatus,
            topServices,
            cashFlowLast30Days);
    }
}
