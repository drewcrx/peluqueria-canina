using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Products.ListProducts;

public class ListProductsQueryHandler(IApplicationDbContext db) : IRequestHandler<ListProductsQuery, IReadOnlyList<ProductDto>>
{
    public async Task<IReadOnlyList<ProductDto>> Handle(ListProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await db.Products
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        return [.. products.Select(p => new ProductDto(p.Id, p.Name, p.StockQuantity, p.MinStock, p.UnitPrice, p.IsActive, p.IsLowStock))];
    }
}
