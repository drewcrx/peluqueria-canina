using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.CashRegister.AddCashTransaction;
using PeluqueriaSaas.Application.Features.CashRegister.CloseCashSession;
using PeluqueriaSaas.Application.Features.CashRegister.GetCurrentCashSession;
using PeluqueriaSaas.Application.Features.CashRegister.ListCashSessions;
using PeluqueriaSaas.Application.Features.CashRegister.OpenCashSession;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Api.Controllers;

public record OpenCashSessionRequest(decimal OpeningAmount);
public record AddCashTransactionRequest(CashTransactionType Type, decimal Amount, string? Description);
public record CloseCashSessionRequest(decimal ClosingAmount);

[ApiController]
[Route("api/cash-register")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class CashRegisterController(ISender mediator) : ControllerBase
{
    [HttpGet("current")]
    public async Task<ActionResult<CurrentCashSessionDto?>> GetCurrent(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetCurrentCashSessionQuery(), cancellationToken));
    }

    [HttpGet("sessions")]
    public async Task<ActionResult<IReadOnlyList<CashSessionSummaryDto>>> ListSessions(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new ListCashSessionsQuery(), cancellationToken));
    }

    [HttpPost("open")]
    public async Task<ActionResult<Guid>> Open(OpenCashSessionRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(new OpenCashSessionCommand(request.OpeningAmount), cancellationToken);
        return Ok(id);
    }

    [HttpPost("transactions")]
    public async Task<IActionResult> AddTransaction(AddCashTransactionRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new AddCashTransactionCommand(request.Type, request.Amount, request.Description), cancellationToken);
        return NoContent();
    }

    [HttpPost("close")]
    public async Task<ActionResult<CloseCashSessionResultDto>> Close(CloseCashSessionRequest request, CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new CloseCashSessionCommand(request.ClosingAmount), cancellationToken));
    }
}
