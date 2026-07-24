using MediatR;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Public.SubmitIntake;

public record SubmitIntakeCommand(
    string Slug,
    string ClientFullName,
    string ClientPhone,
    string? ClientEmail,
    string? ClientAddress,
    string PetName,
    Guid BreedId,
    PetSex PetSex,
    int? PetAgeYears,
    decimal? PetWeightKg,
    string? PetColor,
    StoredFile? PetPhoto,
    string? Vaccines,
    string? Diseases,
    string? Medications,
    string? Allergies,
    string? Observations,
    IReadOnlyList<Guid> RequestedServiceIds,
    IReadOnlyList<StoredFile> Photos,
    StoredFile? Signature) : IRequest<SubmitIntakeResultDto>;

public record SubmitIntakeResultDto(Guid ClientId, Guid PetId, string ClientFullName, string PetName);
