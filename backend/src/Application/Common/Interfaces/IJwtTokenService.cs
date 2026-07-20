namespace PeluqueriaSaas.Application.Common.Interfaces;

public record AccessTokenResult(string Token, DateTime ExpiresAt);
public record RefreshTokenResult(string Token, string TokenHash, DateTime ExpiresAt);

/// <summary>
/// Deliberately works with primitive claims (not the Identity ApplicationUser type) so
/// Application has no dependency on Infrastructure/Identity — only Infrastructure implements this.
/// </summary>
public interface IJwtTokenService
{
    AccessTokenResult GenerateAccessToken(Guid userId, string email, string fullName, Guid? tenantId, IEnumerable<string> roles);
    RefreshTokenResult GenerateRefreshToken();
    string HashRefreshToken(string rawToken);
}
