using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

public class Notification : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public string Message { get; private set; } = default!;
    public bool IsRead { get; private set; }

    private Notification() { }

    public static Notification Create(Guid tenantId, string message) => new()
    {
        TenantId = tenantId,
        Message = message,
        IsRead = false
    };

    public void MarkRead() => IsRead = true;
}
