namespace PeluqueriaSaas.Application.Common.Interfaces;

/// <summary>
/// Scoped per-request view of "who is this request acting as". Populated by
/// TenantResolutionMiddleware right after authentication. Defaults to the safe/deny state
/// (TenantId null, IsPlatformAdmin false) until explicitly set — a request that never
/// authenticates sees zero rows from any tenant-scoped table, never all of them.
/// </summary>
public interface ITenantContext
{
    Guid? TenantId { get; }
    bool IsPlatformAdmin { get; }
}
