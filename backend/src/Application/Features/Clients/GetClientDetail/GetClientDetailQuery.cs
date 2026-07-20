using MediatR;

namespace PeluqueriaSaas.Application.Features.Clients.GetClientDetail;

public record GetClientDetailQuery(Guid ClientId) : IRequest<ClientDetailDto>;

public record PetSummaryDto(Guid Id, string Name, string BreedName, string Sex, int? AgeYears);

public record ClientDetailDto(
    Guid Id,
    string FullName,
    string Phone,
    string? Email,
    string? Address,
    DateTime CreatedAt,
    IReadOnlyList<PetSummaryDto> Pets);
