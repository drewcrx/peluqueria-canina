using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Auth.Logout;

public class LogoutCommandHandler(IApplicationDbContext db, IJwtTokenService tokenService) : IRequestHandler<LogoutCommand>
{
    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RawRefreshToken))
        {
            return;
        }

        var tokenHash = tokenService.HashRefreshToken(request.RawRefreshToken);
        var token = await db.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

        token?.Revoke();
        await db.SaveChangesAsync(cancellationToken);
    }
}
