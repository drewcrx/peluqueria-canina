using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

public class Service : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = default!;
    public bool IsActive { get; private set; } = true;

    private Service() { }

    public static Service Create(Guid tenantId, string name) => new()
    {
        TenantId = tenantId,
        Name = name,
        IsActive = true
    };

    public void Rename(string name) => Name = name;
    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;
}
