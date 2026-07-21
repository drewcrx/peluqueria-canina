using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

/// <summary>
/// A photo staff attaches to a specific visit (e.g. before/after grooming) — distinct from the
/// photos a client uploads on the public intake form (IntakeSubmission.PhotoUrls), which are
/// about registering the pet, not documenting a service.
/// </summary>
public class AppointmentPhoto : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid AppointmentId { get; private set; }
    public string PhotoUrl { get; private set; } = default!;

    private AppointmentPhoto() { }

    public static AppointmentPhoto Create(Guid tenantId, Guid appointmentId, string photoUrl) => new()
    {
        TenantId = tenantId,
        AppointmentId = appointmentId,
        PhotoUrl = photoUrl
    };
}
