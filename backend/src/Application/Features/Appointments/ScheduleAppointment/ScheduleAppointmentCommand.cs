using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Appointments.ScheduleAppointment;

public record ScheduleAppointmentCommand(Guid AppointmentId, DateTime ScheduledAt) : IRequest;

public class ScheduleAppointmentCommandHandler(IApplicationDbContext db) : IRequestHandler<ScheduleAppointmentCommand>
{
    public async Task Handle(ScheduleAppointmentCommand request, CancellationToken cancellationToken)
    {
        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken)
            ?? throw new NotFoundException("Cita no encontrada.");

        appointment.Schedule(request.ScheduledAt);
        await db.SaveChangesAsync(cancellationToken);
    }
}
