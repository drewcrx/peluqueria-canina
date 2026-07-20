using MediatR;

namespace PeluqueriaSaas.Application.Features.Breeds.ListBreeds;

public record ListBreedsQuery : IRequest<IReadOnlyList<BreedDto>>;

public record BreedDto(Guid Id, string Name);
