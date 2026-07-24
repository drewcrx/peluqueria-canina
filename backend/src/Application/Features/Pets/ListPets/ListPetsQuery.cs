using MediatR;

namespace PeluqueriaSaas.Application.Features.Pets.ListPets;

public record ListPetsQuery : IRequest<IReadOnlyList<PetListItemDto>>;

public record PetListItemDto(
    Guid Id,
    string Name,
    string BreedName,
    string Sex,
    int? AgeYears,
    string? PhotoUrl,
    Guid ClientId,
    string ClientFullName);
