using MediatR;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Employees.SetEmployeeActive;

public record SetEmployeeActiveCommand(Guid EmployeeId, bool IsActive) : IRequest;

public class SetEmployeeActiveCommandHandler(
    IIdentityService identityService, ITenantContext tenantContext, ICurrentUserService currentUserService)
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

        var targetRoles = await identityService.GetRolesAsync(request.EmployeeId, cancellationToken);
        if (targetRoles.Contains(RoleNames.TenantOwner))
        {
            throw new ForbiddenException("No se puede desactivar al dueño de la cuenta.");
        }

        if (targetRoles.Contains(RoleNames.Manager))
        {
            var actingUserRoles = await identityService.GetRolesAsync(currentUserService.RequireUserId(), cancellationToken);
            if (!actingUserRoles.Contains(RoleNames.TenantOwner))
            {
                throw new ForbiddenException("Solo el dueño puede desactivar a un Gerente.");
            }
        }

        await identityService.SetActiveAsync(request.EmployeeId, request.IsActive, cancellationToken);
    }
}
