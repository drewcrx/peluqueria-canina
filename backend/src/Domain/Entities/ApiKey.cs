using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

/// <summary>
/// Not ITenantScoped on purpose, same reasoning as RefreshToken: it's looked up by hash during
/// authentication, before any tenant context exists to filter by.
/// </summary>
public class ApiKey : BaseEntity
{
    public Guid TenantId { get; private set; }
    public string KeyHash { get; private set; } = default!;
    public string MaskedPreview { get; private set; } = default!;
    public DateTime? LastUsedAt { get; private set; }
    public DateTime? RevokedAt { get; private set; }

    private ApiKey() { }

    public static ApiKey Create(Guid tenantId, string keyHash, string maskedPreview) => new()
    {
        TenantId = tenantId,
        KeyHash = keyHash,
        MaskedPreview = maskedPreview
    };

    public bool IsActive => RevokedAt is null;

    public void Revoke() => RevokedAt = DateTime.UtcNow;

    public void MarkUsed() => LastUsedAt = DateTime.UtcNow;
}
