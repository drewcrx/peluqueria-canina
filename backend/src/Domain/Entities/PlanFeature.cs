using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

public class PlanFeature : BaseEntity
{
    public Guid PlanId { get; private set; }
    public string FeatureKey { get; private set; } = default!;

    private PlanFeature() { }

    public static PlanFeature Create(Guid planId, string featureKey) => new()
    {
        PlanId = planId,
        FeatureKey = featureKey
    };
}
