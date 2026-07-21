using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.CashRegister.CloseCashSession;

public record CloseCashSessionCommand(decimal ClosingAmount) : IRequest<CloseCashSessionResultDto>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Caja;
}

public record CloseCashSessionResultDto(decimal ExpectedAmount, decimal ClosingAmount, decimal Difference);

public class CloseCashSessionCommandValidator : AbstractValidator<CloseCashSessionCommand>
{
    public CloseCashSessionCommandValidator()
    {
        RuleFor(x => x.ClosingAmount).GreaterThanOrEqualTo(0);
    }
}

public class CloseCashSessionCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CloseCashSessionCommand, CloseCashSessionResultDto>
{
    public async Task<CloseCashSessionResultDto> Handle(CloseCashSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await db.CashRegisterSessions
            .Where(s => s.Status == CashSessionStatus.Open)
            .OrderByDescending(s => s.OpenedAt)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new ConflictException("No hay una caja abierta.");

        var transactions = await db.CashTransactions.Where(t => t.SessionId == session.Id).ToListAsync(cancellationToken);
        var totalIncome = transactions.Where(t => t.Type == CashTransactionType.Income).Sum(t => t.Amount);
        var totalExpense = transactions.Where(t => t.Type == CashTransactionType.Expense).Sum(t => t.Amount);
        var expectedAmount = session.OpeningAmount + totalIncome - totalExpense;

        session.Close(currentUser.RequireUserId(), request.ClosingAmount);
        await db.SaveChangesAsync(cancellationToken);

        return new CloseCashSessionResultDto(expectedAmount, request.ClosingAmount, request.ClosingAmount - expectedAmount);
    }
}
