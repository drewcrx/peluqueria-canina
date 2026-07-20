using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Employees.CreateEmployee;
using PeluqueriaSaas.Application.Features.Employees.ListEmployees;
using PeluqueriaSaas.Application.Features.Employees.SetEmployeeActive;

namespace PeluqueriaSaas.Api.Controllers;

public record CreateEmployeeRequest(string FullName, string Email);
public record SetEmployeeActiveRequest(bool IsActive);

[ApiController]
[Route("api/employees")]
[Authorize(Policy = AuthorizationPolicies.TenantOwner)]
public class EmployeesController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> List(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new ListEmployeesQuery(), cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<CreateEmployeeResultDto>> Create(CreateEmployeeRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CreateEmployeeCommand(request.FullName, request.Email), cancellationToken);
        return Ok(result);
    }

    [HttpPut("{employeeId:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid employeeId, SetEmployeeActiveRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new SetEmployeeActiveCommand(employeeId, request.IsActive), cancellationToken);
        return NoContent();
    }
}
