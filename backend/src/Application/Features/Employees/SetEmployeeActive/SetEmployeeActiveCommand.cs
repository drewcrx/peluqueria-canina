using MediatR;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Employees.SetEmployeeActive;

public record SetEmployeeActiveCommand(Guid EmployeeId, bool IsActive) : IRequest;

public class SetEmployeeActiveCommandHandler(IIdentityService identityService, ITenantContext tenantContext)
    : IRequestHandler<SetEmployeeActiveCommand>
{
    public async Task Handle(SetEmployeeActiveCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();

        var employee = await identityService.FindByIdAsync(request.EmployeeId, cancellationToken);
        if (employee is null || employee.TenantId != tenantId)
        {
            throw new NotFoundException("Empleado no encontrado.");
        }

        await identityService.SetActiveAsync(request.EmployeeId, request.IsActive, cancellationToken);
    }
}
