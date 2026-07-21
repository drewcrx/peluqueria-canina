using MediatR;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Products.ListProducts;

public record ListProductsQuery : IRequest<IReadOnlyList<ProductDto>>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Inventory;
}

public record ProductDto(Guid Id, string Name, int StockQuantity, int? MinStock, decimal? UnitPrice, bool IsActive, bool IsLowStock);
