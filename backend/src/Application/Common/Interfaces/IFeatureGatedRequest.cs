namespace PeluqueriaSaas.Application.Common.Interfaces;

/// <summary>
/// Implemented by any Command/Query that belongs to a plan-gated module (Inventario, Caja,
/// and future ones). FeatureGateBehavior checks it automatically — handlers never re-implement
/// the same "does this tenant's plan include X" check.
/// </summary>
public interface IFeatureGatedRequest
{
    string RequiredFeatureKey { get; }
}
