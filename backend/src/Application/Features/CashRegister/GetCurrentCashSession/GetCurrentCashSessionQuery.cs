using MediatR;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.CashRegister.GetCurrentCashSession;

public record GetCurrentCashSessionQuery : IRequest<CurrentCashSessionDto?>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Caja;
}

public record CashTransactionDto(Guid Id, string Type, decimal Amount, string? Description, DateTime CreatedAt);

public record CurrentCashSessionDto(
    Guid Id,
    DateTime OpenedAt,
    decimal OpeningAmount,
    string OpenedByName,
    decimal TotalIncome,
    decimal TotalExpense,
    decimal ExpectedAmount,
    IReadOnlyList<CashTransactionDto> Transactions);
