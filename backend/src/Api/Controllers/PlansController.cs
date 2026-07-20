using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Application.Features.Plans.ListPlans;

namespace PeluqueriaSaas.Api.Controllers;

[ApiController]
[Route("api/plans")]
[AllowAnonymous]
public class PlansController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PlanDto>>> List(CancellationToken cancellationToken)
    {
        var plans = await mediator.Send(new ListPlansQuery(), cancellationToken);
        return Ok(plans);
    }
}
