namespace PeluqueriaSaas.Application.Common;

/// <summary>
/// Calcula los horarios disponibles de un día dado el horario de atención y las citas ya
/// ocupadas. Se usa tanto para mostrarle opciones al cliente en el formulario público como para
/// re-validar (evitar carreras) al momento de recibir su envío.
/// </summary>
public static class AvailabilityCalculator
{
    public static IReadOnlyList<TimeOnly> ComputeAvailableSlots(
        DateOnly date,
        bool isOpen,
        TimeOnly? openTime,
        TimeOnly? closeTime,
        int slotDurationMinutes,
        IEnumerable<DateTime> occupiedStarts,
        DateTime now)
    {
        if (!isOpen || openTime is null || closeTime is null)
        {
            return [];
        }

        var duration = TimeSpan.FromMinutes(slotDurationMinutes);
        var occupied = occupiedStarts.ToList();
        var slots = new List<TimeOnly>();

        var cursor = openTime.Value.ToTimeSpan();
        var closeSpan = closeTime.Value.ToTimeSpan();

        while (cursor + duration <= closeSpan)
        {
            var slotStart = TimeOnly.FromTimeSpan(cursor);
            var slotStartDateTime = date.ToDateTime(slotStart);
            var slotEndDateTime = slotStartDateTime.Add(duration);

            var isPast = slotStartDateTime <= now;
            var overlaps = occupied.Any(apptStart => slotStartDateTime < apptStart.Add(duration) && apptStart < slotEndDateTime);

            if (!isPast && !overlaps)
            {
                slots.Add(slotStart);
            }

            cursor += duration;
        }

        return slots;
    }
}
