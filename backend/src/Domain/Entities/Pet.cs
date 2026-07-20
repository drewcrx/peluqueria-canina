using PeluqueriaSaas.Domain.Common;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Domain.Entities;

public class Pet : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid ClientId { get; private set; }
    public string Name { get; private set; } = default!;
    public Guid BreedId { get; private set; }
    public PetSex Sex { get; private set; }
    public int? AgeYears { get; private set; }
    public decimal? WeightKg { get; private set; }
    public string? Vaccines { get; private set; }
    public string? Diseases { get; private set; }
    public string? Medications { get; private set; }
    public string? Allergies { get; private set; }

    private Pet() { }

    public static Pet Create(
        Guid tenantId,
        Guid clientId,
        string name,
        Guid breedId,
        PetSex sex,
        int? ageYears,
        decimal? weightKg,
        string? vaccines,
        string? diseases,
        string? medications,
        string? allergies) => new()
    {
        TenantId = tenantId,
        ClientId = clientId,
        Name = name,
        BreedId = breedId,
        Sex = sex,
        AgeYears = ageYears,
        WeightKg = weightKg,
        Vaccines = vaccines,
        Diseases = diseases,
        Medications = medications,
        Allergies = allergies
    };
}
