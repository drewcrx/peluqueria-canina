using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.CashRegister.AddCashTransaction;

public record AddCashTransactionCommand(CashTransactionType Type, decimal Amount, string? Description)
    : IRequest, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Caja;
}

public class AddCashTransactionCommandValidator : AbstractValidator<AddCashTransactionCommand>
{
    public AddCashTransactionCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0);
    }
}

public class AddCashTransactionCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<AddCashTransactionCommand>
{
    public async Task Handle(AddCashTransactionCommand request, CancellationToken cancellationToken)
    {
        var session = await db.CashRegisterSessions
            .Where(s => s.Status == CashSessionStatus.Open)
            .OrderByDescending(s => s.OpenedAt)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new ConflictException("No hay una caja abierta. Ábrela primero.");

        db.CashTransactions.Add(
            CashTransaction.Create(tenantContext.RequireTenantId(), session.Id, request.Type, request.Amount, request.Description));

        await db.SaveChangesAsync(cancellationToken);
    }
}
