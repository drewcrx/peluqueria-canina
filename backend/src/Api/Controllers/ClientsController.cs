using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Application.Features.Clients.CreateClient;
using PeluqueriaSaas.Application.Features.Clients.GetClientDetail;
using PeluqueriaSaas.Application.Features.Clients.ListClients;
using PeluqueriaSaas.Application.Features.Pets.CreatePet;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Api.Controllers;

public record CreateClientRequest(string FullName, string Phone, string? Email, string? Address);

public class CreatePetRequest
{
    public string Name { get; set; } = default!;
    public Guid BreedId { get; set; }
    public PetSex Sex { get; set; }
    public int? AgeYears { get; set; }
    public decimal? WeightKg { get; set; }
    public string? Color { get; set; }
    public IFormFile? Photo { get; set; }
    public string? Vaccines { get; set; }
    public string? Diseases { get; set; }
    public string? Medications { get; set; }
    public string? Allergies { get; set; }
}

[ApiController]
[Route("api/clients")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class ClientsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ClientSummaryDto>>> List(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new ListClientsQuery(), cancellationToken));
    }

    [HttpGet("{clientId:guid}")]
    public async Task<ActionResult<ClientDetailDto>> GetDetail(Guid clientId, CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetClientDetailQuery(clientId), cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateClientRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(
            new CreateClientCommand(request.FullName, request.Phone, request.Email, request.Address), cancellationToken);
        return CreatedAtAction(nameof(GetDetail), new { clientId = id }, id);
    }

    [HttpPost("{clientId:guid}/pets")]
    [RequestSizeLimit(5_000_000)]
    public async Task<ActionResult<Guid>> AddPet(Guid clientId, [FromForm] CreatePetRequest request, CancellationToken cancellationToken)
    {
        var photo = request.Photo is null ? null : new StoredFile(request.Photo.FileName, request.Photo.OpenReadStream(), request.Photo.ContentType);

        var id = await mediator.Send(
            new CreatePetCommand(
                clientId, request.Name, request.BreedId, request.Sex, request.AgeYears, request.WeightKg,
                request.Color, photo, request.Vaccines, request.Diseases, request.Medications, request.Allergies),
            cancellationToken);

        return CreatedAtAction(nameof(GetDetail), new { clientId }, id);
    }
}
