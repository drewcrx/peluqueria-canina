using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Notifications.ListNotifications;
using PeluqueriaSaas.Application.Features.Notifications.MarkNotificationRead;

namespace PeluqueriaSaas.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize(Policy = AuthorizationPolicies.TenantUser)]
public class NotificationsController(ISender mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<NotificationsResultDto>> List(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new ListNotificationsQuery(), cancellationToken));
    }

    [HttpPost("{notificationId:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid notificationId, CancellationToken cancellationToken)
    {
        await mediator.Send(new MarkNotificationReadCommand(notificationId), cancellationToken);
        return NoContent();
    }
}
