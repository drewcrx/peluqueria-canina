using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Services.CreateService;
using PeluqueriaSaas.Application.Features.Services.ListServices;
using PeluqueriaSaas.Application.Features.Services.UpdateService;

namespace PeluqueriaSaas.Api.Controllers;

public record CreateServiceRequest(string Name);
public record UpdateServiceRequest(string Name, bool IsActive);

[ApiController]
[Route("api/services")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class ServicesController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ServiceDto>>> List(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new ListServicesQuery(), cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateServiceRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new CreateServiceCommand(request.Name), cancellationToken);
        return Ok(id);
    }

    [HttpPut("{serviceId:guid}")]
    public async Task<IActionResult> Update(Guid serviceId, UpdateServiceRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateServiceCommand(serviceId, request.Name, request.IsActive), cancellationToken);
        return NoContent();
    }
}
