using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Application.Features.Breeds.ListBreeds;

namespace PeluqueriaSaas.Api.Controllers;

[ApiController]
[Route("api/breeds")]
[AllowAnonymous]
public class BreedsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BreedDto>>> List(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new ListBreedsQuery(), cancellationToken));
    }
}
