namespace PeluqueriaSaas.Application.Common.Interfaces;

/// <summary>
/// Central point for "can this tenant do X". Consumed by future modules (Fase 4+) so plan
/// limits are never re-implemented as scattered `if (plan == "Pro")` checks.
/// </summary>
public interface IEntitlementService
{
    Task<bool> HasFeatureAsync(Guid tenantId, string featureKey, CancellationToken cancellationToken = default);
    Task<bool> CanAddEmployeeAsync(Guid tenantId, CancellationToken cancellationToken = default);
}
