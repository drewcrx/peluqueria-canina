using MediatR;

namespace PeluqueriaSaas.Application.Features.Pets.GetPetHistory;

public record GetPetHistoryQuery(Guid PetId) : IRequest<PetHistoryDto>;

public record HistoryEntryDto(
    Guid Id,
    DateTime? ScheduledAt,
    string Status,
    string? Notes,
    DateTime? CompletedAt,
    IReadOnlyList<string> ServiceNames,
    IReadOnlyList<string> PhotoUrls);

public record PetHistoryDto(
    Guid PetId,
    string PetName,
    string BreedName,
    string Sex,
    int? AgeYears,
    decimal? WeightKg,
    string? Vaccines,
    string? Diseases,
    string? Medications,
    string? Allergies,
    string ClientFullName,
    Guid ClientId,
    IReadOnlyList<HistoryEntryDto> Appointments);
