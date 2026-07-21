using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Admin.Tenants.ChangeSubscription;
using PeluqueriaSaas.Application.Features.Admin.Tenants.GetTenantDetail;
using PeluqueriaSaas.Application.Features.Admin.Tenants.ListTenants;
using PeluqueriaSaas.Application.Features.Admin.Tenants.SeedDemoData;
using PeluqueriaSaas.Application.Features.Admin.Tenants.SetTenantStatus;

namespace PeluqueriaSaas.Api.Controllers.Admin;

public record ChangeSubscriptionRequest(SubscriptionAction Action, string? NewPlanCode);
public record SetTenantStatusRequest(bool Suspend);

[ApiController]
[Route("api/admin/tenants")]
[Authorize(Policy = AuthorizationPolicies.PlatformAdmin)]
public class AdminTenantsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TenantSummaryDto>>> List(CancellationToken cancellationToken)
    {
        var tenants = await mediator.Send(new ListTenantsQuery(), cancellationToken);
        return Ok(tenants);
    }

    [HttpGet("{tenantId:guid}")]
    public async Task<ActionResult<TenantDetailDto>> GetDetail(Guid tenantId, CancellationToken cancellationToken)
    {
        var tenant = await mediator.Send(new GetTenantDetailQuery(tenantId), cancellationToken);
        return Ok(tenant);
    }

    [HttpPost("{tenantId:guid}/subscription")]
    public async Task<IActionResult> ChangeSubscription(Guid tenantId, ChangeSubscriptionRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new ChangeSubscriptionCommand(tenantId, request.Action, request.NewPlanCode), cancellationToken);
        return NoContent();
    }

    [HttpPost("{tenantId:guid}/status")]
    public async Task<IActionResult> SetStatus(Guid tenantId, SetTenantStatusRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new SetTenantStatusCommand(tenantId, request.Suspend), cancellationToken);
        return NoContent();
    }

    [HttpPost("{tenantId:guid}/seed-demo-data")]
    public async Task<IActionResult> SeedDemoData(Guid tenantId, CancellationToken cancellationToken)
    {
        await mediator.Send(new SeedDemoDataCommand(tenantId), cancellationToken);
        return NoContent();
    }
}
