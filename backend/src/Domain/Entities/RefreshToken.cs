using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = default!;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }

    private RefreshToken() { }

    public static RefreshToken Create(Guid userId, string tokenHash, DateTime expiresAt) => new()
    {
        UserId = userId,
        TokenHash = tokenHash,
        ExpiresAt = expiresAt
    };

    public bool IsActive => RevokedAt is null && ExpiresAt > DateTime.UtcNow;

    public void Revoke() => RevokedAt = DateTime.UtcNow;
}
