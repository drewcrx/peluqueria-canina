using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

public class Product : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = default!;
    public int StockQuantity { get; private set; }
    public int? MinStock { get; private set; }
    public decimal? UnitPrice { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Product() { }

    public static Product Create(Guid tenantId, string name, int initialStock, int? minStock, decimal? unitPrice) => new()
    {
        TenantId = tenantId,
        Name = name,
        StockQuantity = initialStock,
        MinStock = minStock,
        UnitPrice = unitPrice,
        IsActive = true
    };

    public void Update(string name, int? minStock, decimal? unitPrice)
    {
        Name = name;
        MinStock = minStock;
        UnitPrice = unitPrice;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;

    public bool IsLowStock => MinStock.HasValue && StockQuantity <= MinStock.Value;

    /// <summary>Positive delta adds stock (entrada), negative removes it (salida). Never lets stock go negative.</summary>
    public void AdjustStock(int delta)
    {
        var newQuantity = StockQuantity + delta;
        if (newQuantity < 0)
        {
            throw new InvalidOperationException("No hay suficiente stock para esta salida.");
        }

        StockQuantity = newQuantity;
    }
}
