using MediatR;

namespace PeluqueriaSaas.Application.Features.Clients.CreateClient;

public record CreateClientCommand(string FullName, string Phone, string? Email, string? Address) : IRequest<Guid>;
