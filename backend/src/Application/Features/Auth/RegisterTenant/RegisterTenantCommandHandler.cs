using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Application.Features.Auth.Common;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Auth.RegisterTenant;

public class RegisterTenantCommandHandler(
    IApplicationDbContext db,
    IIdentityService identityService,
    IJwtTokenService tokenService)
    : IRequestHandler<RegisterTenantCommand, AuthResultDto>
{
    private static readonly TimeSpan TrialLength = TimeSpan.FromDays(14);
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);
    private static readonly string[] DefaultServiceNames =
        ["Baño", "Corte", "Baño + Corte", "Corte de uñas", "Desparasitación"];

    public async Task<AuthResultDto> Handle(RegisterTenantCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await identityService.FindByEmailAsync(request.OwnerEmail, cancellationToken);
        if (existingUser is not null)
        {
            throw new ConflictException("Ya existe una cuenta registrada con este correo electrónico.");
        }

        var basicPlan = await db.Plans.FirstOrDefaultAsync(p => p.Code == PlanCodes.Basico && p.IsActive, cancellationToken)
            ?? throw new InvalidOperationException("El plan Básico no está configurado (ejecuta el seed de planes).");

        var slug = await GenerateUniqueSlugAsync(db, cancellationToken);
        var tenant = Tenant.Create(request.CompanyName, slug);
        db.Tenants.Add(tenant);

        var subscription = Subscription.StartTrial(tenant.Id, basicPlan.Id, TrialLength);
        db.Subscriptions.Add(subscription);

        // Servicios por defecto para que el formulario público tenga algo que mostrar desde el
        // día uno — el dueño los edita o los reemplaza después desde el dashboard.
        db.Services.AddRange(DefaultServiceNames.Select(name => Service.Create(tenant.Id, name)));

        // El usuario se crea al final: UserManager guarda internamente vía el mismo DbContext,
        // por lo que este SaveChanges implícito persiste Tenant + Subscription + User en una sola
        // transacción atómica (comportamiento estándar de EF Core al detectar múltiples entidades
        // rastreadas). No se necesita una transacción explícita.
        var createResult = await identityService.CreateUserAsync(
            request.OwnerEmail, request.OwnerPassword, request.OwnerFullName, tenant.Id, cancellationToken);

        if (!createResult.Succeeded || createResult.UserId is null)
        {
            throw new ValidationException([
                new FluentValidation.Results.ValidationFailure(
                    nameof(request.OwnerPassword), string.Join(" ", createResult.Errors))
            ]);
        }

        var userId = createResult.UserId.Value;
        await identityService.AddToRoleAsync(userId, RoleNames.TenantOwner, cancellationToken);

        var accessToken = tokenService.GenerateAccessToken(
            userId, request.OwnerEmail, request.OwnerFullName, tenant.Id, [RoleNames.TenantOwner]);
        var refreshToken = tokenService.GenerateRefreshToken();

        db.RefreshTokens.Add(RefreshToken.Create(userId, refreshToken.TokenHash, DateTime.UtcNow.Add(RefreshTokenLifetime)));
        await db.SaveChangesAsync(cancellationToken);

        return new AuthResultDto(
            userId,
            request.OwnerEmail,
            request.OwnerFullName,
            tenant.Id,
            [RoleNames.TenantOwner],
            accessToken.Token,
            accessToken.ExpiresAt,
            refreshToken.Token,
            refreshToken.ExpiresAt);
    }

    private static async Task<string> GenerateUniqueSlugAsync(IApplicationDbContext db, CancellationToken cancellationToken)
    {
        const string alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
        var random = Random.Shared;

        for (var attempt = 0; attempt < 10; attempt++)
        {
            var slug = new string([.. Enumerable.Range(0, 8).Select(_ => alphabet[random.Next(alphabet.Length)])]);
            var exists = await db.Tenants.AnyAsync(t => t.PublicFormSlug == slug, cancellationToken);
            if (!exists)
            {
                return slug;
            }
        }

        throw new InvalidOperationException("No se pudo generar un slug único para el formulario público.");
    }
}
