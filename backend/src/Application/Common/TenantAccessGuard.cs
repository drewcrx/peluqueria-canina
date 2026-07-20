using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Common;

/// <summary>
/// Shared by Login and Refresh: a suspended tenant or a lapsed subscription must not be able
/// to keep a session alive just by holding a still-valid refresh token.
/// </summary>
public static class TenantAccessGuard
{
    public static async Task EnsureTenantHasAccessAsync(IApplicationDbContext db, Guid tenantId, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new AuthenticationException("La cuenta asociada a esta sesión ya no existe.");

        if (tenant.Status == TenantStatus.Suspended)
        {
            throw new AuthenticationException("Esta cuenta ha sido suspendida. Contacta al soporte de la plataforma.");
        }

        // IgnoreQueryFilters: esta comprobación corre antes/fuera de que el contexto de tenant
        // del request esté resuelto (Login) o para un usuario cuyo contexto aún no aplica (Refresh),
        // así que el filtro global de tenant devolvería siempre cero filas si no se ignora aquí.
        var subscription = await db.Subscriptions
            .IgnoreQueryFilters()
            .Where(s => s.TenantId == tenantId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (subscription is null || !subscription.GrantsAccess)
        {
            throw new AuthenticationException("La suscripción de esta peluquería no está activa.");
        }
    }
}
