using PeluqueriaSaas.Domain.Common;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Domain.Entities;

public class Tenant : BaseEntity
{
    public string Name { get; private set; } = default!;
    public string PublicFormSlug { get; private set; } = default!;
    public TenantStatus Status { get; private set; } = TenantStatus.Active;

    // Fase 7 "próximamente" — capturados pero sin conexión real todavía (ver FeatureKeys.WhatsApp/CustomDomain).
    public string? WhatsAppNumber { get; private set; }
    public string? CustomDomainRequested { get; private set; }

    // Identidad de marca del propio negocio — disponible en todos los planes, no es una
    // funcionalidad premium (a diferencia de WhatsApp/dominio propio/API).
    public string? LogoUrl { get; private set; }
    public string? BrandColor { get; private set; }

    // Duración asumida de cualquier cita, en minutos — usada para generar los horarios
    // disponibles del formulario público y detectar cruces. Es un solo valor para todo el
    // negocio (no por servicio) a propósito: mantiene la función simple de configurar.
    public int SlotDurationMinutes { get; private set; } = 60;

    private Tenant() { }

    public static Tenant Create(string name, string publicFormSlug) => new()
    {
        Name = name,
        PublicFormSlug = publicFormSlug,
        Status = TenantStatus.Active
    };

    public void Suspend() => Status = TenantStatus.Suspended;
    public void Reactivate() => Status = TenantStatus.Active;

    public void SetWhatsAppNumber(string? whatsAppNumber) => WhatsAppNumber = whatsAppNumber;
    public void SetCustomDomainRequested(string? customDomain) => CustomDomainRequested = customDomain;

    public void Rename(string name) => Name = name;
    public void SetLogoUrl(string? logoUrl) => LogoUrl = logoUrl;
    public void SetBrandColor(string? brandColor) => BrandColor = brandColor;
    public void SetSlotDurationMinutes(int minutes) => SlotDurationMinutes = minutes;
}
