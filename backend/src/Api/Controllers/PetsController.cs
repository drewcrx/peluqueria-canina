using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Pets.GetPetHistory;

namespace PeluqueriaSaas.Api.Controllers;

[ApiController]
[Route("api/pets")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class PetsController(ISender mediator) : ControllerBase
{
    [HttpGet("{petId:guid}/history")]
    public async Task<ActionResult<PetHistoryDto>> GetHistory(Guid petId, CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetPetHistoryQuery(petId), cancellationToken));
    }
}
