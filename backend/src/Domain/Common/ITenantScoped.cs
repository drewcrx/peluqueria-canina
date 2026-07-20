namespace PeluqueriaSaas.Domain.Common;

/// <summary>
/// Marker for entities that belong to exactly one tenant. Any entity implementing this
/// gets an automatic EF Core global query filter applied (see ModelBuilderExtensions
/// in Infrastructure) — new tenant-scoped tables never need to remember to filter manually.
/// </summary>
public interface ITenantScoped
{
    Guid TenantId { get; }
}
