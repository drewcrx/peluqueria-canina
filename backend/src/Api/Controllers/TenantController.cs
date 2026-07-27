using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Application.Features.Tenants.GetBusinessHours;
using PeluqueriaSaas.Application.Features.Tenants.GetMyTenant;
using PeluqueriaSaas.Application.Features.Tenants.UpdateBranding;
using PeluqueriaSaas.Application.Features.Tenants.UpdateBusinessHours;
using PeluqueriaSaas.Application.Features.Tenants.UpdateCustomDomain;
using PeluqueriaSaas.Application.Features.Tenants.UpdateWhatsAppSettings;
using PeluqueriaSaas.Application.Features.Tenants.UploadLogo;

namespace PeluqueriaSaas.Api.Controllers;

public record UpdateWhatsAppSettingsRequest(string? WhatsAppNumber);
public record UpdateCustomDomainRequest(string? CustomDomainRequested);
public record UpdateBrandingRequest(string Name, string? BrandColor);
public record UploadLogoRequest(IFormFile Logo);
public record UpdateBusinessHoursRequest(int SlotDurationMinutes, IReadOnlyList<DayHoursInput> Days);

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

    [HttpPut("branding")]
    [Authorize(Policy = AuthorizationPolicies.TenantOwner)]
    public async Task<IActionResult> UpdateBranding(UpdateBrandingRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateBrandingCommand(request.Name, request.BrandColor), cancellationToken);
        return NoContent();
    }

    [HttpGet("business-hours")]
    public async Task<ActionResult<BusinessHoursDto>> GetBusinessHours(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetBusinessHoursQuery(), cancellationToken));
    }

    [HttpPut("business-hours")]
    [Authorize(Policy = AuthorizationPolicies.TenantOwner)]
    public async Task<IActionResult> UpdateBusinessHours(UpdateBusinessHoursRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new UpdateBusinessHoursCommand(request.SlotDurationMinutes, request.Days), cancellationToken);
        return NoContent();
    }

    [HttpPost("logo")]
    [Authorize(Policy = AuthorizationPolicies.TenantOwner)]
    [RequestSizeLimit(5_000_000)]
    public async Task<ActionResult<string>> UploadLogo([FromForm] UploadLogoRequest request, CancellationToken cancellationToken)
    {
        var logo = new StoredFile(request.Logo.FileName, request.Logo.OpenReadStream(), request.Logo.ContentType);
        var url = await mediator.Send(new UploadLogoCommand(logo), cancellationToken);
        return Ok(url);
    }
}
