using PeluqueriaSaas.Domain.Common;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Domain.Entities;

/// <summary>
/// A single visit — scheduled, pending, or already completed. "Historial" is not a separate
/// entity: it's simply this same table queried per pet and ordered by date. Keeping one entity
/// avoids two tables silently drifting out of sync about the same real-world fact.
/// </summary>
public class Appointment : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid ClientId { get; private set; }
    public Guid PetId { get; private set; }
    public DateTime? ScheduledAt { get; private set; }
    public AppointmentStatus Status { get; private set; }
    public string? Notes { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public DateTime? ReminderSentAt { get; private set; }

    private readonly List<AppointmentService> _requestedServices = [];
    public IReadOnlyCollection<AppointmentService> RequestedServices => _requestedServices.AsReadOnly();

    private Appointment() { }

    public static Appointment Create(
        Guid tenantId, Guid clientId, Guid petId, DateTime? scheduledAt, string? notes, IEnumerable<Guid> serviceIds)
    {
        var appointment = new Appointment
        {
            TenantId = tenantId,
            ClientId = clientId,
            PetId = petId,
            ScheduledAt = scheduledAt,
            Status = scheduledAt.HasValue ? AppointmentStatus.Scheduled : AppointmentStatus.PendingSchedule,
            Notes = notes
        };

        appointment._requestedServices.AddRange(
            serviceIds.Select(serviceId => AppointmentService.Create(appointment.Id, serviceId)));

        return appointment;
    }

    public void Schedule(DateTime scheduledAt)
    {
        ScheduledAt = scheduledAt;
        Status = AppointmentStatus.Scheduled;
    }

    public void MarkCompleted()
    {
        Status = AppointmentStatus.Completed;
        CompletedAt = DateTime.UtcNow;
    }

    public void Cancel() => Status = AppointmentStatus.Cancelled;

    public void MarkReminderSent() => ReminderSentAt = DateTime.UtcNow;
}

public class AppointmentService
{
    public Guid AppointmentId { get; private set; }
    public Guid ServiceId { get; private set; }

    private AppointmentService() { }

    public static AppointmentService Create(Guid appointmentId, Guid serviceId) => new()
    {
        AppointmentId = appointmentId,
        ServiceId = serviceId
    };
}
