using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Application.Features.Pets.GetPetHistory;
using PeluqueriaSaas.Application.Features.Pets.ListPets;
using PeluqueriaSaas.Application.Features.Pets.UpdatePetPhoto;

namespace PeluqueriaSaas.Api.Controllers;

public record UpdatePetPhotoRequest(IFormFile Photo);

[ApiController]
[Route("api/pets")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class PetsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<PetListItemDto>>> List(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new ListPetsQuery(), cancellationToken));
    }

    [HttpGet("{petId:guid}/history")]
    public async Task<ActionResult<PetHistoryDto>> GetHistory(Guid petId, CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetPetHistoryQuery(petId), cancellationToken));
    }

    [HttpPost("{petId:guid}/photo")]
    [RequestSizeLimit(5_000_000)]
    public async Task<ActionResult<string>> UploadPhoto(Guid petId, [FromForm] UpdatePetPhotoRequest request, CancellationToken cancellationToken)
    {
        var photo = new StoredFile(request.Photo.FileName, request.Photo.OpenReadStream(), request.Photo.ContentType);
        var url = await mediator.Send(new UpdatePetPhotoCommand(petId, photo), cancellationToken);
        return Ok(url);
    }
}
