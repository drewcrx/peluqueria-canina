using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Application.Features.Auth.Common;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Auth.Refresh;

public class RefreshTokenCommandHandler(
    IApplicationDbContext db,
    IIdentityService identityService,
    IJwtTokenService tokenService)
    : IRequestHandler<RefreshTokenCommand, AuthResultDto>
{
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);
    private const string InvalidTokenMessage = "La sesión expiró. Vuelve a iniciar sesión.";

    public async Task<AuthResultDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var tokenHash = tokenService.HashRefreshToken(request.RawRefreshToken);

        var existingToken = await db.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken)
            ?? throw new AuthenticationException(InvalidTokenMessage);

        if (!existingToken.IsActive)
        {
            throw new AuthenticationException(InvalidTokenMessage);
        }

        var user = await identityService.FindByIdAsync(existingToken.UserId, cancellationToken)
            ?? throw new AuthenticationException(InvalidTokenMessage);

        if (!user.IsActive)
        {
            throw new AuthenticationException(InvalidTokenMessage);
        }

        if (user.TenantId is { } tenantId)
        {
            await TenantAccessGuard.EnsureTenantHasAccessAsync(db, tenantId, cancellationToken);
        }

        // Rotación: el refresh token usado queda revocado y se emite uno nuevo. Si alguien
        // reutiliza un refresh token ya revocado, la próxima llamada fallará aquí.
        existingToken.Revoke();

        var roles = await identityService.GetRolesAsync(user.Id, cancellationToken);
        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Email, user.FullName, user.TenantId, roles);
        var newRefreshToken = tokenService.GenerateRefreshToken();

        db.RefreshTokens.Add(RefreshToken.Create(user.Id, newRefreshToken.TokenHash, DateTime.UtcNow.Add(RefreshTokenLifetime)));
        await db.SaveChangesAsync(cancellationToken);

        return new AuthResultDto(
            user.Id,
            user.Email,
            user.FullName,
            user.TenantId,
            [.. roles],
            accessToken.Token,
            accessToken.ExpiresAt,
            newRefreshToken.Token,
            newRefreshToken.ExpiresAt);
    }
}
