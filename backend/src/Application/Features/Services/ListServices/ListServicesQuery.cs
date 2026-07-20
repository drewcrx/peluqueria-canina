using MediatR;

namespace PeluqueriaSaas.Application.Features.Services.ListServices;

public record ListServicesQuery : IRequest<IReadOnlyList<ServiceDto>>;

public record ServiceDto(Guid Id, string Name, bool IsActive);
