using MediatR;

namespace PeluqueriaSaas.Application.Features.Clients.ListClients;

public record ListClientsQuery : IRequest<IReadOnlyList<ClientSummaryDto>>;

public record ClientSummaryDto(Guid Id, string FullName, string Phone, string? Email, int PetCount, DateTime CreatedAt);
