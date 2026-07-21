using PeluqueriaSaas.Domain.Common;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Domain.Entities;

/// <summary>Permanent record of why a Product's stock changed — never edited or deleted.</summary>
public class StockMovement : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid ProductId { get; private set; }
    public StockMovementType Type { get; private set; }
    public int Quantity { get; private set; }
    public string? Reason { get; private set; }

    private StockMovement() { }

    public static StockMovement Create(Guid tenantId, Guid productId, StockMovementType type, int quantity, string? reason) => new()
    {
        TenantId = tenantId,
        ProductId = productId,
        Type = type,
        Quantity = quantity,
        Reason = reason
    };
}
