using MediatR;

namespace PeluqueriaSaas.Application.Features.Services.CreateService;

public record CreateServiceCommand(string Name) : IRequest<Guid>;
