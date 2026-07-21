using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.ApiKeys.GenerateApiKey;
using PeluqueriaSaas.Application.Features.ApiKeys.GetApiKeyStatus;

namespace PeluqueriaSaas.Api.Controllers;

[ApiController]
[Route("api/api-keys")]
[Authorize(Policy = AuthorizationPolicies.TenantOwner)]
public class ApiKeysController(ISender mediator) : ControllerBase
{
    [HttpGet("status")]
    public async Task<ActionResult<ApiKeyStatusDto>> GetStatus(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetApiKeyStatusQuery(), cancellationToken));
    }

    [HttpPost("generate")]
    public async Task<ActionResult<string>> Generate(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GenerateApiKeyCommand(), cancellationToken));
    }
}
