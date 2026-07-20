using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Infrastructure.Multitenancy;

namespace PeluqueriaSaas.Api.Middleware;

/// <summary>
/// Runs after authentication, before authorization/endpoints: translates the authenticated
/// user's claims into the request-scoped TenantContext that EF Core's global query filters read.
/// </summary>
public class TenantResolutionMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, TenantContext tenantContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantClaim = context.User.FindFirst("tenant_id")?.Value;
            if (!string.IsNullOrEmpty(tenantClaim) && Guid.TryParse(tenantClaim, out var tenantId))
            {
                tenantContext.SetTenant(tenantId);
            }
            else if (context.User.IsInRole(RoleNames.PlatformAdmin))
            {
                tenantContext.SetPlatformAdmin();
            }
        }

        await next(context);
    }
}
