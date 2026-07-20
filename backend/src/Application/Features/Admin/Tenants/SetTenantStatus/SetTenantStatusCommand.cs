using MediatR;

namespace PeluqueriaSaas.Application.Features.Admin.Tenants.SetTenantStatus;

public record SetTenantStatusCommand(Guid TenantId, bool Suspend) : IRequest;
