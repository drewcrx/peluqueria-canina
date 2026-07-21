using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Products.AdjustStock;

public record AdjustStockCommand(Guid ProductId, StockMovementType Type, int Quantity, string? Reason)
    : IRequest, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Inventory;
}

public class AdjustStockCommandValidator : AbstractValidator<AdjustStockCommand>
{
    public AdjustStockCommandValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
    }
}

public class AdjustStockCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<AdjustStockCommand>
{
    public async Task Handle(AdjustStockCommand request, CancellationToken cancellationToken)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken)
            ?? throw new NotFoundException("Producto no encontrado.");

        var delta = request.Type == StockMovementType.In ? request.Quantity : -request.Quantity;

        try
        {
            product.AdjustStock(delta);
        }
        catch (InvalidOperationException ex)
        {
            throw new ConflictException(ex.Message);
        }

        db.StockMovements.Add(
            StockMovement.Create(tenantContext.RequireTenantId(), product.Id, request.Type, request.Quantity, request.Reason));

        await db.SaveChangesAsync(cancellationToken);
    }
}
