using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Infrastructure.Multitenancy;

/// <summary>
/// Registered as scoped (once per request). Starts in the safe/deny state; only
/// TenantResolutionMiddleware is expected to call SetTenant/SetPlatformAdmin.
/// </summary>
public class TenantContext : ITenantContext
{
    public Guid? TenantId { get; private set; }
    public bool IsPlatformAdmin { get; private set; }

    public void SetTenant(Guid tenantId)
    {
        TenantId = tenantId;
        IsPlatformAdmin = false;
    }

    public void SetPlatformAdmin()
    {
        TenantId = null;
        IsPlatformAdmin = true;
    }
}
