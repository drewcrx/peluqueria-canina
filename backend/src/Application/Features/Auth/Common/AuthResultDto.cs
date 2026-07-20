namespace PeluqueriaSaas.Application.Features.Auth.Common;

public record AuthResultDto(
    Guid UserId,
    string Email,
    string FullName,
    Guid? TenantId,
    string[] Roles,
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt);
