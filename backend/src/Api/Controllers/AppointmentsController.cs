using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Appointments.ChangeAppointmentStatus;
using PeluqueriaSaas.Application.Features.Appointments.CreateAppointment;
using PeluqueriaSaas.Application.Features.Appointments.ListAppointments;
using PeluqueriaSaas.Application.Features.Appointments.ScheduleAppointment;

namespace PeluqueriaSaas.Api.Controllers;

public record CreateAppointmentRequest(Guid ClientId, Guid PetId, DateTime? ScheduledAt, string? Notes, List<Guid> ServiceIds);
public record ScheduleAppointmentRequest(DateTime ScheduledAt);
public record ChangeAppointmentStatusRequest(AppointmentStatusAction Action);

[ApiController]
[Route("api/appointments")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class AppointmentsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AppointmentSummaryDto>>> List([FromQuery] string? status, CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new ListAppointmentsQuery(status), cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<Guid>> Create(CreateAppointmentRequest request, CancellationToken cancellationToken)
    {
        var id = await mediator.Send(
            new CreateAppointmentCommand(request.ClientId, request.PetId, request.ScheduledAt, request.Notes, request.ServiceIds),
            cancellationToken);
        return Ok(id);
    }

    [HttpPut("{appointmentId:guid}/schedule")]
    public async Task<IActionResult> Schedule(Guid appointmentId, ScheduleAppointmentRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new ScheduleAppointmentCommand(appointmentId, request.ScheduledAt), cancellationToken);
        return NoContent();
    }

    [HttpPut("{appointmentId:guid}/status")]
    public async Task<IActionResult> ChangeStatus(Guid appointmentId, ChangeAppointmentStatusRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new ChangeAppointmentStatusCommand(appointmentId, request.Action), cancellationToken);
        return NoContent();
    }
}
