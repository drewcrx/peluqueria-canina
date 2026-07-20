using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

public class Client : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public string FullName { get; private set; } = default!;
    /// <summary>Normalized (digits only) — used to de-duplicate clients across form submissions.</summary>
    public string Phone { get; private set; } = default!;
    public string? Email { get; private set; }
    public string? Address { get; private set; }

    private readonly List<Pet> _pets = [];
    public IReadOnlyCollection<Pet> Pets => _pets.AsReadOnly();

    private Client() { }

    public static Client Create(Guid tenantId, string fullName, string phone, string? email, string? address) => new()
    {
        TenantId = tenantId,
        FullName = fullName,
        Phone = phone,
        Email = email,
        Address = address
    };

    public void Update(string fullName, string? email, string? address)
    {
        FullName = fullName;
        Email = email;
        Address = address;
    }
}
