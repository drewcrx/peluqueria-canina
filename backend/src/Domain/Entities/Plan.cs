using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

public class Plan : BaseEntity
{
    public string Code { get; private set; } = default!;
    public string Name { get; private set; } = default!;
    public decimal PriceUsd { get; private set; }
    /// <summary>Null means unlimited employees (Plan Pro).</summary>
    public int? MaxEmployees { get; private set; }
    public bool IsActive { get; private set; } = true;

    private readonly List<PlanFeature> _features = [];
    public IReadOnlyCollection<PlanFeature> Features => _features.AsReadOnly();

    private Plan() { }

    public static Plan Create(string code, string name, decimal priceUsd, int? maxEmployees) => new()
    {
        Code = code,
        Name = name,
        PriceUsd = priceUsd,
        MaxEmployees = maxEmployees,
        IsActive = true
    };

    public void AddFeature(string featureKey) => _features.Add(PlanFeature.Create(Id, featureKey));
}
