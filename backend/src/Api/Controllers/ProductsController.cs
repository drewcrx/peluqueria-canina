using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Products.AdjustStock;
using PeluqueriaSaas.Application.Features.Products.CreateProduct;
using PeluqueriaSaas.Application.Features.Products.GetProductDetail;
using PeluqueriaSaas.Application.Features.Products.ListProducts;
using PeluqueriaSaas.Application.Features.Products.UpdateProduct;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Api.Controllers;

public record CreateProductRequest(string Name, int InitialStock, int? MinStock, decimal? UnitPrice);
public record UpdateProductRequest(string Name, int? MinStock, decimal? UnitPrice, bool IsActive);
public record AdjustStockRequest(StockMovementType Type, int Quantity, string? Reason);

[ApiController]
[Route("api/products")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class ProductsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> List(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new ListProductsQuery(), cancellationToken));
    }

    [HttpGet("{productId:guid}")]
    public async Task<ActionResult<ProductDetailDto>> GetDetail(Guid productId, CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetProductDetailQuery(productId), cancellationToken));
    }

    [HttpPost]
    [Authorize(Policy = AuthorizationPolicies.TenantOwner)]
    public async Task<ActionResult<Guid>> Create(CreateProductRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(
            new CreateProductCommand(request.Name, request.InitialStock, request.MinStock, request.UnitPrice), cancellationToken);
        return Ok(id);
    }

    [HttpPut("{productId:guid}")]
    [Authorize(Policy = AuthorizationPolicies.TenantOwner)]
    public async Task<IActionResult> Update(Guid productId, UpdateProductRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(
            new UpdateProductCommand(productId, request.Name, request.MinStock, request.UnitPrice, request.IsActive), cancellationToken);
        return NoContent();
    }

    [HttpPost("{productId:guid}/stock-movements")]
    public async Task<IActionResult> AdjustStock(Guid productId, AdjustStockRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new AdjustStockCommand(productId, request.Type, request.Quantity, request.Reason), cancellationToken);
        return NoContent();
    }
}
