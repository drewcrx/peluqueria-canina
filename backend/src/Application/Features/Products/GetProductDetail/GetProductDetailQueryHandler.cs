using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Products.GetProductDetail;

public class GetProductDetailQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetProductDetailQuery, ProductDetailDto>
{
    public async Task<ProductDetailDto> Handle(GetProductDetailQuery request, CancellationToken cancellationToken)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken)
            ?? throw new NotFoundException("Producto no encontrado.");

        var movements = await db.StockMovements
            .Where(m => m.ProductId == product.Id)
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new StockMovementDto(m.Id, m.Type.ToString(), m.Quantity, m.Reason, m.CreatedAt))
            .ToListAsync(cancellationToken);

        return new ProductDetailDto(product.Id, product.Name, product.StockQuantity, product.MinStock, product.UnitPrice, product.IsActive, movements);
    }
}
