using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Tenants.GetMyTenant;
using PeluqueriaSaas.Application.Features.Tenants.UpdateCustomDomain;
using PeluqueriaSaas.Application.Features.Tenants.UpdateWhatsAppSettings;

namespace PeluqueriaSaas.Api.Controllers;

public record UpdateWhatsAppSettingsRequest(string? WhatsAppNumber);
public record UpdateCustomDomainRequest(string? CustomDomainRequested);

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

    [HttpPut("whatsapp-settings")]
    [Authorize(Policy = AuthorizationPolicies.TenantOwner)]
    public async Task<IActionResult> UpdateWhatsAppSettings(UpdateWhatsAppSettingsRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateWhatsAppSettingsCommand(request.WhatsAppNumber), cancellationToken);
        return NoContent();
    }

    [HttpPut("custom-domain")]
    [Authorize(Policy = AuthorizationPolicies.TenantOwner)]
    public async Task<IActionResult> UpdateCustomDomain(UpdateCustomDomainRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateCustomDomainCommand(request.CustomDomainRequested), cancellationToken);
        return NoContent();
    }
}
