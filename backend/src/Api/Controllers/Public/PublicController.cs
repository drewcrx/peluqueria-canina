using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PeluqueriaSaas.Api;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Application.Features.Public.GetPetCard;
using PeluqueriaSaas.Application.Features.Public.GetPublicTenantInfo;
using PeluqueriaSaas.Application.Features.Public.SubmitIntake;

namespace PeluqueriaSaas.Api.Controllers.Public;

[ApiController]
[Route("api/public/tenants")]
[AllowAnonymous]
public class PublicController(ISender mediator) : ControllerBase
{
    [HttpGet("{slug}")]
    public async Task<ActionResult<PublicTenantInfoDto>> GetTenantInfo(string slug, CancellationToken cancellationToken)
    {
        var info = await mediator.Send(new GetPublicTenantInfoQuery(slug), cancellationToken);
        return Ok(info);
    }

    [HttpPost("{slug}/submit")]
    [EnableRateLimiting(RateLimiterPolicies.PublicForm)]
    [RequestSizeLimit(20_000_000)]
    public async Task<ActionResult<SubmitIntakeResultDto>> Submit(
        string slug, [FromForm] SubmitIntakeRequest request, CancellationToken cancellationToken)
    {
        var photos = request.Photos.Select(ToStoredFile).ToList();
        var signature = request.Signature is null ? null : ToStoredFile(request.Signature);
        var petPhoto = request.PetPhoto is null ? null : ToStoredFile(request.PetPhoto);

        var command = new SubmitIntakeCommand(
            slug,
            request.ClientFullName,
            request.ClientPhone,
            request.ClientEmail,
            request.ClientAddress,
            request.PetName,
            request.BreedId,
            request.PetSex,
            request.PetAgeYears,
            request.PetWeightKg,
            request.PetColor,
            petPhoto,
            request.Vaccines,
            request.Diseases,
            request.Medications,
            request.Allergies,
            request.Observations,
            request.RequestedServiceIds,
            photos,
            signature);

        var result = await mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpGet("/api/public/pets/{petId:guid}")]
    public async Task<ActionResult<PetCardDto>> GetPetCard(Guid petId, CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetPetCardQuery(petId), cancellationToken));
    }

    private static StoredFile ToStoredFile(IFormFile file) =>
        new(file.FileName, file.OpenReadStream(), file.ContentType);
}
