using Microsoft.AspNetCore.Identity;

namespace PeluqueriaSaas.Infrastructure.Identity;

/// <summary>
/// Lives in Infrastructure (not Domain) because it depends on the Identity package.
/// TenantId is nullable: null means platform staff, not a salon user.
/// </summary>
public class ApplicationUser : IdentityUser<Guid>
{
    public Guid? TenantId { get; set; }
    public string FullName { get; set; } = default!;
    public bool IsActive { get; set; } = true;
}
