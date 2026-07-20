using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Clients.CreateClient;
using PeluqueriaSaas.Application.Features.Clients.GetClientDetail;
using PeluqueriaSaas.Application.Features.Clients.ListClients;
using PeluqueriaSaas.Application.Features.Pets.CreatePet;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Api.Controllers;

public record CreateClientRequest(string FullName, string Phone, string? Email, string? Address);

public record CreatePetRequest(
    string Name,
    Guid BreedId,
    PetSex Sex,
    int? AgeYears,
    decimal? WeightKg,
    string? Vaccines,
    string? Diseases,
    string? Medications,
    string? Allergies);

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
    public async Task<ActionResult<Guid>> AddPet(Guid clientId, CreatePetRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(
            new CreatePetCommand(
                clientId, request.Name, request.BreedId, request.Sex, request.AgeYears, request.WeightKg,
                request.Vaccines, request.Diseases, request.Medications, request.Allergies),
            cancellationToken);

        return CreatedAtAction(nameof(GetDetail), new { clientId }, id);
    }
}
