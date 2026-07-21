using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Application.Features.Appointments.ChangeAppointmentStatus;
using PeluqueriaSaas.Application.Features.Appointments.CreateAppointment;
using PeluqueriaSaas.Application.Features.Appointments.ListAppointments;
using PeluqueriaSaas.Application.Features.Appointments.ScheduleAppointment;
using PeluqueriaSaas.Application.Features.Appointments.SendAppointmentReminder;
using PeluqueriaSaas.Application.Features.Appointments.UploadAppointmentPhoto;

namespace PeluqueriaSaas.Api.Controllers;

public record CreateAppointmentRequest(Guid ClientId, Guid PetId, DateTime? ScheduledAt, string? Notes, List<Guid> ServiceIds);
public record ScheduleAppointmentRequest(DateTime ScheduledAt);
public record ChangeAppointmentStatusRequest(AppointmentStatusAction Action);
public record UploadAppointmentPhotoRequest(IFormFile Photo);

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

    [HttpPost("{appointmentId:guid}/reminder")]
    public async Task<IActionResult> SendReminder(Guid appointmentId, CancellationToken cancellationToken)
    {
        await mediator.Send(new SendAppointmentReminderCommand(appointmentId), cancellationToken);
        return NoContent();
    }

    [HttpPost("{appointmentId:guid}/photos")]
    [RequestSizeLimit(20_000_000)]
    public async Task<ActionResult<string>> UploadPhoto(
        Guid appointmentId, [FromForm] UploadAppointmentPhotoRequest request, CancellationToken cancellationToken)
    {
        var photo = new StoredFile(request.Photo.FileName, request.Photo.OpenReadStream(), request.Photo.ContentType);
        var url = await mediator.Send(new UploadAppointmentPhotoCommand(appointmentId, photo), cancellationToken);
        return Ok(url);
    }
}
