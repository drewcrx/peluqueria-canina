using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Infrastructure.Identity;

namespace PeluqueriaSaas.Infrastructure.Services;

public class IdentityService(UserManager<ApplicationUser> userManager) : IIdentityService
{
    /// <summary>
    /// ASP.NET Identity's IdentityError.Description always comes back in English regardless of
    /// server locale — there's no built-in Spanish IdentityErrorDescriber. Every one of these
    /// bubbles up to a user-facing toast (see getErrorMessage.ts on the frontend), so an
    /// untranslated "Incorrect password." next to an otherwise all-Spanish UI reads as broken,
    /// not just informal. Translate by the stable .Code, falling back to the English text for any
    /// code this list doesn't know about yet.
    /// </summary>
    private static string TranslateError(IdentityError error) => error.Code switch
    {
        "PasswordMismatch" => "La contraseña actual no es correcta.",
        "PasswordTooShort" => "La contraseña debe tener al menos 8 caracteres.",
        "PasswordRequiresDigit" => "La contraseña debe incluir al menos un número.",
        "PasswordRequiresLower" => "La contraseña debe incluir al menos una minúscula.",
        "PasswordRequiresUpper" => "La contraseña debe incluir al menos una mayúscula.",
        "PasswordRequiresNonAlphanumeric" => "La contraseña debe incluir al menos un carácter especial.",
        "PasswordRequiresUniqueChars" => "La contraseña necesita más caracteres distintos entre sí.",
        "InvalidToken" => "El enlace no es válido o ya expiró.",
        "DuplicateUserName" or "DuplicateEmail" => "Ya existe una cuenta con ese correo.",
        "InvalidEmail" => "El correo no es válido.",
        _ => error.Description,
    };

    private static string[] TranslateErrors(IEnumerable<IdentityError> errors) => [.. errors.Select(TranslateError)];

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
            TranslateErrors(result.Errors));
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

    public async Task<IReadOnlyList<IdentityUserDto>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var users = await userManager.Users
            .IgnoreQueryFilters()
            .Where(u => u.TenantId == tenantId)
            .OrderBy(u => u.FullName)
            .ToListAsync(cancellationToken);

        return [.. users.Select(u => ToDto(u)!)];
    }

    public async Task SetActiveAsync(Guid userId, bool isActive, CancellationToken cancellationToken = default)
    {
        var user = await FindEntityByIdAsync(userId, cancellationToken)
            ?? throw new InvalidOperationException("Usuario no encontrado.");

        user.IsActive = isActive;
        await userManager.UpdateAsync(user);
    }

    public async Task<PasswordOperationResult> ChangePasswordAsync(
        Guid userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default)
    {
        var user = await FindEntityByIdAsync(userId, cancellationToken);
        if (user is null)
        {
            return new PasswordOperationResult(false, ["Usuario no encontrado."]);
        }

        var result = await userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        return new PasswordOperationResult(result.Succeeded, TranslateErrors(result.Errors));
    }

    public async Task<string?> GeneratePasswordResetTokenAsync(string email, CancellationToken cancellationToken = default)
    {
        var user = await userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.NormalizedEmail == email.ToUpperInvariant(), cancellationToken);

        return user is null ? null : await userManager.GeneratePasswordResetTokenAsync(user);
    }

    public async Task<PasswordOperationResult> ResetPasswordAsync(
        string email, string token, string newPassword, CancellationToken cancellationToken = default)
    {
        var user = await userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.NormalizedEmail == email.ToUpperInvariant(), cancellationToken);

        if (user is null)
        {
            return new PasswordOperationResult(false, ["Enlace inválido o expirado."]);
        }

        var result = await userManager.ResetPasswordAsync(user, token, newPassword);
        return new PasswordOperationResult(result.Succeeded, TranslateErrors(result.Errors));
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
