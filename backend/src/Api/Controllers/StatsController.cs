using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Stats.GetDashboardStats;

namespace PeluqueriaSaas.Api.Controllers;

[ApiController]
[Route("api/stats")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class StatsController(ISender mediator) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboard(
        [FromQuery] DateOnly? fromDate, [FromQuery] DateOnly? toDate, CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetDashboardStatsQuery(fromDate, toDate), cancellationToken));
    }
}
