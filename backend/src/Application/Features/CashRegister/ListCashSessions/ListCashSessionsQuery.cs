using MediatR;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.CashRegister.ListCashSessions;

public record ListCashSessionsQuery : IRequest<IReadOnlyList<CashSessionSummaryDto>>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Caja;
}

public record CashSessionSummaryDto(
    Guid Id,
    DateTime OpenedAt,
    DateTime? ClosedAt,
    decimal OpeningAmount,
    decimal? ClosingAmount,
    decimal? Difference,
    string OpenedByName);
