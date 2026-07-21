using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Appointments.ListAppointments;

public class ListAppointmentsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ListAppointmentsQuery, IReadOnlyList<AppointmentSummaryDto>>
{
    public async Task<IReadOnlyList<AppointmentSummaryDto>> Handle(ListAppointmentsQuery request, CancellationToken cancellationToken)
    {
        var query = db.Appointments.AsQueryable();

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<AppointmentStatus>(request.Status, out var status))
        {
            query = query.Where(a => a.Status == status);
        }

        var appointments = await query
            .OrderBy(a => a.ScheduledAt)
            .ThenBy(a => a.CreatedAt)
            .Join(db.Clients, a => a.ClientId, c => c.Id, (a, c) => new { Appointment = a, ClientName = c.FullName })
            .Join(db.Pets, x => x.Appointment.PetId, p => p.Id, (x, p) => new { x.Appointment, x.ClientName, PetName = p.Name })
            .ToListAsync(cancellationToken);

        var appointmentIds = appointments.Select(x => x.Appointment.Id).ToList();

        var serviceNamesByAppointment = await db.AppointmentServices
            .Where(aps => appointmentIds.Contains(aps.AppointmentId))
            .Join(db.Services, aps => aps.ServiceId, s => s.Id, (aps, s) => new { aps.AppointmentId, ServiceName = s.Name })
            .ToListAsync(cancellationToken);

        return [.. appointments.Select(x => new AppointmentSummaryDto(
            x.Appointment.Id,
            x.Appointment.ClientId,
            x.ClientName,
            x.Appointment.PetId,
            x.PetName,
            x.Appointment.ScheduledAt,
            x.Appointment.Status.ToString(),
            x.Appointment.Notes,
            x.Appointment.ReminderSentAt,
            [.. serviceNamesByAppointment.Where(s => s.AppointmentId == x.Appointment.Id).Select(s => s.ServiceName)]))];
    }
}
