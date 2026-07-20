using MediatR;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Pets.CreatePet;

public record CreatePetCommand(
    Guid ClientId,
    string Name,
    Guid BreedId,
    PetSex Sex,
    int? AgeYears,
    decimal? WeightKg,
    string? Vaccines,
    string? Diseases,
    string? Medications,
    string? Allergies) : IRequest<Guid>;
