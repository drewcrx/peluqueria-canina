using MediatR;

namespace PeluqueriaSaas.Application.Features.Public.GetPetCard;

// Sin IFeatureGatedRequest a propósito: la tarjeta de identificación de la mascota (con QR)
// es una funcionalidad disponible en cualquier plan, no solo en los planes superiores.
public record GetPetCardQuery(Guid PetId) : IRequest<PetCardDto>;

public record PetCardVisitDto(DateTime Date, IReadOnlyList<string> ServiceNames);

public record PetCardDto(
    Guid PetId,
    string PetName,
    string BreedName,
    string Sex,
    int? AgeYears,
    decimal? WeightKg,
    string? Color,
    string? PhotoUrl,
    string? Vaccines,
    string? Diseases,
    string? Medications,
    string? Allergies,
    string OwnerFullName,
    string OwnerPhone,
    string TenantName,
    string? TenantLogoUrl,
    string? TenantBrandColor,
    IReadOnlyList<PetCardVisitDto> RecentVisits);
