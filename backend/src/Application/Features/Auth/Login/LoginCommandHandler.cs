using MediatR;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Application.Features.Auth.Common;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Auth.Login;

public class LoginCommandHandler(
    IApplicationDbContext db,
    IIdentityService identityService,
    IJwtTokenService tokenService)
    : IRequestHandler<LoginCommand, AuthResultDto>
{
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);
    private const string InvalidCredentialsMessage = "Correo o contraseña incorrectos.";

    public async Task<AuthResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await identityService.FindByEmailAsync(request.Email, cancellationToken)
            ?? throw new AuthenticationException(InvalidCredentialsMessage);

        if (!user.IsActive || !await identityService.CheckPasswordAsync(user.Id, request.Password, cancellationToken))
        {
            throw new AuthenticationException(InvalidCredentialsMessage);
        }

        if (user.TenantId is { } tenantId)
        {
            await TenantAccessGuard.EnsureTenantHasAccessAsync(db, tenantId, cancellationToken);
        }

        var roles = await identityService.GetRolesAsync(user.Id, cancellationToken);

        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Email, user.FullName, user.TenantId, roles);
        var refreshToken = tokenService.GenerateRefreshToken();

        db.RefreshTokens.Add(RefreshToken.Create(user.Id, refreshToken.TokenHash, DateTime.UtcNow.Add(RefreshTokenLifetime)));
        await db.SaveChangesAsync(cancellationToken);

        return new AuthResultDto(
            user.Id,
            user.Email,
            user.FullName,
            user.TenantId,
            [.. roles],
            accessToken.Token,
            accessToken.ExpiresAt,
            refreshToken.Token,
            refreshToken.ExpiresAt);
    }
}
