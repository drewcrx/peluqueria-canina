using MediatR;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Employees.ListEmployees;

public class ListEmployeesQueryHandler(IIdentityService identityService, ITenantContext tenantContext)
    : IRequestHandler<ListEmployeesQuery, IReadOnlyList<EmployeeDto>>
{
    public async Task<IReadOnlyList<EmployeeDto>> Handle(ListEmployeesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();
        var users = await identityService.ListByTenantAsync(tenantId, cancellationToken);

        var result = new List<EmployeeDto>();
        foreach (var user in users)
        {
            var roles = await identityService.GetRolesAsync(user.Id, cancellationToken);
            result.Add(new EmployeeDto(user.Id, user.FullName, user.Email, user.IsActive, roles));
        }

        return result;
    }
}
