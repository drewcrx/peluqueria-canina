using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Appointments.SendAppointmentReminder;

public record SendAppointmentReminderCommand(Guid AppointmentId) : IRequest, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Reminders;
}

public class SendAppointmentReminderCommandHandler(IApplicationDbContext db, INotificationSender notificationSender, ITenantContext tenantContext)
    : IRequestHandler<SendAppointmentReminderCommand>
{
    public async Task Handle(SendAppointmentReminderCommand request, CancellationToken cancellationToken)
    {
        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken)
            ?? throw new NotFoundException("Cita no encontrada.");

        if (appointment.Status != AppointmentStatus.Scheduled || appointment.ScheduledAt is null)
        {
            throw new ConflictException("Solo se pueden enviar recordatorios de citas agendadas.");
        }

        var client = await db.Clients.FirstOrDefaultAsync(c => c.Id == appointment.ClientId, cancellationToken)
            ?? throw new NotFoundException("Cliente no encontrado.");

        var pet = await db.Pets.FirstOrDefaultAsync(p => p.Id == appointment.PetId, cancellationToken)
            ?? throw new NotFoundException("Mascota no encontrada.");

        var message = $"Hola {client.FullName}, te recordamos la cita de {pet.Name} el " +
            $"{appointment.ScheduledAt:dd/MM/yyyy HH:mm}.";

        await notificationSender.SendAsync(tenantContext.RequireTenantId(), client.Phone, message, cancellationToken);

        appointment.MarkReminderSent();
        await db.SaveChangesAsync(cancellationToken);
    }
}
