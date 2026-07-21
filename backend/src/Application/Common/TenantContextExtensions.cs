using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Common;

public static class TenantContextExtensions
{
    public static Guid RequireTenantId(this ITenantContext tenantContext) =>
        tenantContext.TenantId ?? throw new AuthenticationException("Esta operación requiere una sesión de peluquería.");

    public static Guid RequireUserId(this ICurrentUserService currentUserService) =>
        currentUserService.UserId ?? throw new AuthenticationException("Esta operación requiere una sesión iniciada.");
}
