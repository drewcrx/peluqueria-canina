using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Infrastructure.Identity;

namespace PeluqueriaSaas.Infrastructure.Services;

public class IdentityService(UserManager<ApplicationUser> userManager) : IIdentityService
{
    public async Task<CreateUserResult> CreateUserAsync(
        string email, string password, string fullName, Guid? tenantId, CancellationToken cancellationToken = default)
    {
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            TenantId = tenantId,
            IsActive = true
        };

        var result = await userManager.CreateAsync(user, password);

        return new CreateUserResult(
            result.Succeeded,
            result.Succeeded ? user.Id : null,
            [.. result.Errors.Select(e => e.Description)]);
    }

    public async Task AddToRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default)
    {
        var user = await FindEntityByIdAsync(userId, cancellationToken)
            ?? throw new InvalidOperationException("Usuario no encontrado al asignar el rol.");

        await userManager.AddToRoleAsync(user, role);
    }

    public async Task<IdentityUserDto?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.NormalizedEmail == email.ToUpperInvariant(), cancellationToken);

        return ToDto(user);
    }

    public async Task<IdentityUserDto?> FindByIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await FindEntityByIdAsync(userId, cancellationToken);
        return ToDto(user);
    }

    public async Task<bool> CheckPasswordAsync(Guid userId, string password, CancellationToken cancellationToken = default)
    {
        var user = await FindEntityByIdAsync(userId, cancellationToken);
        return user is not null && await userManager.CheckPasswordAsync(user, password);
    }

    public async Task<IReadOnlyList<string>> GetRolesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await FindEntityByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return [];
        }

        var roles = await userManager.GetRolesAsync(user);
        return [.. roles];
    }

    /// <summary>
    /// All lookups in this service go through here instead of UserManager.FindByIdAsync: these
    /// calls happen during login/registration/refresh, before the request's tenant context is
    /// resolved, so the ApplicationUser global query filter would otherwise hide every user.
    /// </summary>
    private async Task<ApplicationUser?> FindEntityByIdAsync(Guid userId, CancellationToken cancellationToken) =>
        await userManager.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

    private static IdentityUserDto? ToDto(ApplicationUser? user) =>
        user is null ? null : new IdentityUserDto(user.Id, user.Email!, user.FullName, user.TenantId, user.IsActive);
}
