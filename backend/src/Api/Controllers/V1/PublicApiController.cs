using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Application.Features.Appointments.ListAppointments;
using PeluqueriaSaas.Application.Features.Clients.ListClients;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Api.Controllers.V1;

/// <summary>
/// Read-only surface for Pro-tenant integrations (Zapier-style automations, custom dashboards).
/// Reuses the same MediatR queries the SPA calls — this controller's only job is the API-key
/// auth channel and the entitlement check, since IFeatureGatedRequest gates whole commands/queries
/// and these two are also used, ungated, by the cookie-authenticated SPA for every plan.
/// </summary>
[ApiController]
[Route("api/v1")]
[Authorize(AuthenticationSchemes = ApiKeyAuthenticationDefaults.Scheme, Policy = AuthorizationPolicies.TenantUser)]
public class PublicApiController(ISender mediator, IEntitlementService entitlementService, ITenantContext tenantContext)
    : ControllerBase
{
    [HttpGet("clients")]
    public async Task<ActionResult<IReadOnlyList<ClientSummaryDto>>> ListClients(CancellationToken cancellationToken)
    {
        await EnsureApiEntitlementAsync(cancellationToken);
        return Ok(await mediator.Send(new ListClientsQuery(), cancellationToken));
    }

    [HttpGet("appointments")]
    public async Task<ActionResult<IReadOnlyList<AppointmentSummaryDto>>> ListAppointments(
        [FromQuery] string? status, CancellationToken cancellationToken)
    {
        await EnsureApiEntitlementAsync(cancellationToken);
        return Ok(await mediator.Send(new ListAppointmentsQuery(status), cancellationToken));
    }

    private async Task EnsureApiEntitlementAsync(CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();
        if (!await entitlementService.HasFeatureAsync(tenantId, FeatureKeys.Api, cancellationToken))
        {
            throw new ForbiddenException("Tu plan no incluye acceso a la API.");
        }
    }
}
