using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

/// <summary>
/// El horario de atención de un día de la semana para un tenant. Hay una fila por día (0-6,
/// domingo a sábado) — se siembran las 7 al crear el tenant para que el formulario público
/// siempre tenga algo que mostrar, y el dueño las ajusta desde el dashboard.
/// </summary>
public class BusinessHours : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public DayOfWeek DayOfWeek { get; private set; }
    public bool IsOpen { get; private set; }
    public TimeOnly? OpenTime { get; private set; }
    public TimeOnly? CloseTime { get; private set; }

    private BusinessHours() { }

    public static BusinessHours Create(Guid tenantId, DayOfWeek dayOfWeek, bool isOpen, TimeOnly? openTime, TimeOnly? closeTime) => new()
    {
        TenantId = tenantId,
        DayOfWeek = dayOfWeek,
        IsOpen = isOpen,
        OpenTime = openTime,
        CloseTime = closeTime
    };

    public void Update(bool isOpen, TimeOnly? openTime, TimeOnly? closeTime)
    {
        IsOpen = isOpen;
        OpenTime = openTime;
        CloseTime = closeTime;
    }
}
