using MediatR;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Products.GetProductDetail;

public record GetProductDetailQuery(Guid ProductId) : IRequest<ProductDetailDto>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Inventory;
}

public record StockMovementDto(Guid Id, string Type, int Quantity, string? Reason, DateTime CreatedAt);

public record ProductDetailDto(
    Guid Id, string Name, int StockQuantity, int? MinStock, decimal? UnitPrice, bool IsActive, IReadOnlyList<StockMovementDto> Movements);
