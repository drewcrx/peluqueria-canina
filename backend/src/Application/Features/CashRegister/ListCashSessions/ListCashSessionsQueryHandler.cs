using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.CashRegister.ListCashSessions;

public class ListCashSessionsQueryHandler(IApplicationDbContext db, IIdentityService identityService)
    : IRequestHandler<ListCashSessionsQuery, IReadOnlyList<CashSessionSummaryDto>>
{
    public async Task<IReadOnlyList<CashSessionSummaryDto>> Handle(ListCashSessionsQuery request, CancellationToken cancellationToken)
    {
        var sessions = await db.CashRegisterSessions
            .Where(s => s.Status == CashSessionStatus.Closed)
            .OrderByDescending(s => s.ClosedAt)
            .ToListAsync(cancellationToken);

        var sessionIds = sessions.Select(s => s.Id).ToList();
        var transactions = await db.CashTransactions
            .Where(t => sessionIds.Contains(t.SessionId))
            .ToListAsync(cancellationToken);

        var result = new List<CashSessionSummaryDto>();
        foreach (var session in sessions)
        {
            var sessionTransactions = transactions.Where(t => t.SessionId == session.Id);
            var totalIncome = sessionTransactions.Where(t => t.Type == CashTransactionType.Income).Sum(t => t.Amount);
            var totalExpense = sessionTransactions.Where(t => t.Type == CashTransactionType.Expense).Sum(t => t.Amount);
            var expected = session.OpeningAmount + totalIncome - totalExpense;

            var openedBy = await identityService.FindByIdAsync(session.OpenedByUserId, cancellationToken);

            result.Add(new CashSessionSummaryDto(
                session.Id,
                session.OpenedAt,
                session.ClosedAt,
                session.OpeningAmount,
                session.ClosingAmount,
                session.ClosingAmount - expected,
                openedBy?.FullName ?? "—"));
        }

        return result;
    }
}
