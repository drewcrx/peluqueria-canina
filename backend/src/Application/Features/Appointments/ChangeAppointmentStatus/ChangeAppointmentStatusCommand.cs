using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Appointments.ChangeAppointmentStatus;

public enum AppointmentStatusAction
{
    Complete,
    Cancel
}

public record ChangeAppointmentStatusCommand(Guid AppointmentId, AppointmentStatusAction Action) : IRequest;

public class ChangeAppointmentStatusCommandHandler(IApplicationDbContext db) : IRequestHandler<ChangeAppointmentStatusCommand>
{
    public async Task Handle(ChangeAppointmentStatusCommand request, CancellationToken cancellationToken)
    {
        var appointment = await db.Appointments.FirstOrDefaultAsync(a => a.Id == request.AppointmentId, cancellationToken)
            ?? throw new NotFoundException("Cita no encontrada.");

        if (request.Action == AppointmentStatusAction.Complete)
        {
            appointment.MarkCompleted();
        }
        else
        {
            appointment.Cancel();
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
