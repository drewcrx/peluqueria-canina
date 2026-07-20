using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Tenants.GetMyTenant;

namespace PeluqueriaSaas.Api.Controllers;

[ApiController]
[Route("api/tenant")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class TenantController(ISender mediator) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<MyTenantDto>> GetMe(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetMyTenantQuery(), cancellationToken);
        return Ok(result);
    }
}
