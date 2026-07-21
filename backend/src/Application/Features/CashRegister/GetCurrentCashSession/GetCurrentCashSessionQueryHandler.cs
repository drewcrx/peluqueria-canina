using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.CashRegister.GetCurrentCashSession;

public class GetCurrentCashSessionQueryHandler(IApplicationDbContext db, IIdentityService identityService)
    : IRequestHandler<GetCurrentCashSessionQuery, CurrentCashSessionDto?>
{
    public async Task<CurrentCashSessionDto?> Handle(GetCurrentCashSessionQuery request, CancellationToken cancellationToken)
    {
        var session = await db.CashRegisterSessions
            .Where(s => s.Status == CashSessionStatus.Open)
            .OrderByDescending(s => s.OpenedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (session is null)
        {
            return null;
        }

        var transactions = await db.CashTransactions
            .Where(t => t.SessionId == session.Id)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);

        var openedBy = await identityService.FindByIdAsync(session.OpenedByUserId, cancellationToken);

        var totalIncome = transactions.Where(t => t.Type == CashTransactionType.Income).Sum(t => t.Amount);
        var totalExpense = transactions.Where(t => t.Type == CashTransactionType.Expense).Sum(t => t.Amount);

        return new CurrentCashSessionDto(
            session.Id,
            session.OpenedAt,
            session.OpeningAmount,
            openedBy?.FullName ?? "—",
            totalIncome,
            totalExpense,
            session.OpeningAmount + totalIncome - totalExpense,
            [.. transactions.Select(t => new CashTransactionDto(t.Id, t.Type.ToString(), t.Amount, t.Description, t.CreatedAt))]);
    }
}
