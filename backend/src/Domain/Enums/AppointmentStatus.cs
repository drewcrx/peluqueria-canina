namespace PeluqueriaSaas.Domain.Enums;

public enum AppointmentStatus
{
    /// <summary>Llegó desde el formulario público u otra fuente sin una fecha asignada todavía.</summary>
    PendingSchedule = 0,
    Scheduled = 1,
    Completed = 2,
    Cancelled = 3
}
