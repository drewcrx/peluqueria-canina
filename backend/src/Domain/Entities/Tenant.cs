using PeluqueriaSaas.Domain.Common;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Domain.Entities;

public class Tenant : BaseEntity
{
    public string Name { get; private set; } = default!;
    public string PublicFormSlug { get; private set; } = default!;
    public TenantStatus Status { get; private set; } = TenantStatus.Active;

    private Tenant() { }

    public static Tenant Create(string name, string publicFormSlug) => new()
    {
        Name = name,
        PublicFormSlug = publicFormSlug,
        Status = TenantStatus.Active
    };

    public void Suspend() => Status = TenantStatus.Suspended;
    public void Reactivate() => Status = TenantStatus.Active;
}
