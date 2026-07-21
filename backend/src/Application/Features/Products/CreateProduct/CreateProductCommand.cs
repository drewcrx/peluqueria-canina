using FluentValidation;
using MediatR;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Products.CreateProduct;

public record CreateProductCommand(string Name, int InitialStock, int? MinStock, decimal? UnitPrice)
    : IRequest<Guid>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Inventory;
}

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.InitialStock).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinStock).GreaterThanOrEqualTo(0).When(x => x.MinStock.HasValue);
        RuleFor(x => x.UnitPrice).GreaterThanOrEqualTo(0).When(x => x.UnitPrice.HasValue);
    }
}

public class CreateProductCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateProductCommand, Guid>
{
    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = Product.Create(
            tenantContext.RequireTenantId(), request.Name, request.InitialStock, request.MinStock, request.UnitPrice);

        db.Products.Add(product);
        await db.SaveChangesAsync(cancellationToken);

        return product.Id;
    }
}
