namespace PeluqueriaSaas.Application.Common.Interfaces;

public record IdentityUserDto(Guid Id, string Email, string FullName, Guid? TenantId, bool IsActive);
public record CreateUserResult(bool Succeeded, Guid? UserId, string[] Errors);
public record PasswordOperationResult(bool Succeeded, string[] Errors);

/// <summary>
/// Wraps ASP.NET Identity's UserManager/RoleManager behind primitive DTOs so Application
/// never references the concrete ApplicationUser/ApplicationRole types, which live in
/// Infrastructure (they depend on the Identity package — Domain and Application must not).
/// </summary>
public interface IIdentityService
{
    Task<CreateUserResult> CreateUserAsync(string email, string password, string fullName, Guid? tenantId, CancellationToken cancellationToken = default);
    Task AddToRoleAsync(Guid userId, string role, CancellationToken cancellationToken = default);
    Task<IdentityUserDto?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IdentityUserDto?> FindByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> CheckPasswordAsync(Guid userId, string password, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetRolesAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<IdentityUserDto>> ListByTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task SetActiveAsync(Guid userId, bool isActive, CancellationToken cancellationToken = default);
    Task<PasswordOperationResult> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default);
    /// <returns>Null if there is no user with that email — callers must not leak that distinction to the client.</returns>
    Task<string?> GeneratePasswordResetTokenAsync(string email, CancellationToken cancellationToken = default);
    Task<PasswordOperationResult> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken cancellationToken = default);
}
