using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Api.Controllers.Public;

public class SubmitIntakeRequest
{
    public string ClientFullName { get; set; } = default!;
    public string ClientPhone { get; set; } = default!;
    public string? ClientEmail { get; set; }
    public string? ClientAddress { get; set; }
    public string PetName { get; set; } = default!;
    public Guid BreedId { get; set; }
    public PetSex PetSex { get; set; }
    public int? PetAgeYears { get; set; }
    public decimal? PetWeightKg { get; set; }
    public string? PetColor { get; set; }
    public IFormFile? PetPhoto { get; set; }
    public string? Vaccines { get; set; }
    public string? Diseases { get; set; }
    public string? Medications { get; set; }
    public string? Allergies { get; set; }
    public string? Observations { get; set; }
    public List<Guid> RequestedServiceIds { get; set; } = [];
    public List<IFormFile> Photos { get; set; } = [];
    public IFormFile? Signature { get; set; }
}
