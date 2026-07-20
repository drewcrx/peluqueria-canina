using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Common;

public static class TenantContextExtensions
{
    public static Guid RequireTenantId(this ITenantContext tenantContext) =>
        tenantContext.TenantId ?? throw new AuthenticationException("Esta operación requiere una sesión de peluquería.");
}
