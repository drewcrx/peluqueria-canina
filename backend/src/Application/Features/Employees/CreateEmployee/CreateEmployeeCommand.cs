using FluentValidation;
using MediatR;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;
using ValidationException = PeluqueriaSaas.Application.Common.Exceptions.ValidationException;

namespace PeluqueriaSaas.Application.Features.Employees.CreateEmployee;

public record CreateEmployeeCommand(string FullName, string Email, string Role) : IRequest<CreateEmployeeResultDto>;

public record CreateEmployeeResultDto(Guid UserId, string TemporaryPassword);

public class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Role).NotEmpty().Must(r => r is RoleNames.Employee or RoleNames.Manager)
            .WithMessage("Rol inválido.");
    }
}

public class CreateEmployeeCommandHandler(
    IIdentityService identityService,
    IEntitlementService entitlementService,
    ITenantContext tenantContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<CreateEmployeeCommand, CreateEmployeeResultDto>
{
    public async Task<CreateEmployeeResultDto> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();

        if (!await entitlementService.CanAddEmployeeAsync(tenantId, cancellationToken))
        {
            throw new ConflictException(
                "Alcanzaste el límite de empleados de tu plan actual. Actualiza tu plan para agregar más.");
        }

        if (request.Role == RoleNames.Manager)
        {
            // Solo el Dueño puede crear Gerentes (evita que un Gerente se auto-promueva o promueva
            // a otros creando empleados con rol Manager), y solo si el plan incluye el feature.
            var actingUserRoles = await identityService.GetRolesAsync(currentUserService.RequireUserId(), cancellationToken);
            if (!actingUserRoles.Contains(RoleNames.TenantOwner))
            {
                throw new ForbiddenException("Solo el dueño puede asignar el rol de Gerente.");
            }

            if (!await entitlementService.HasFeatureAsync(tenantId, FeatureKeys.AdvancedRoles, cancellationToken))
            {
                throw new ConflictException("El rol de Gerente no está disponible en tu plan actual.");
            }
        }

        var existing = await identityService.FindByEmailAsync(request.Email, cancellationToken);
        if (existing is not null)
        {
            throw new ConflictException("Ya existe una cuenta registrada con este correo electrónico.");
        }

        var temporaryPassword = TemporaryPasswordGenerator.Generate();

        var result = await identityService.CreateUserAsync(
            request.Email, temporaryPassword, request.FullName, tenantId, cancellationToken);

        if (!result.Succeeded || result.UserId is null)
        {
            throw new ValidationException([
                new FluentValidation.Results.ValidationFailure(nameof(request.Email), string.Join(" ", result.Errors))
            ]);
        }

        await identityService.AddToRoleAsync(result.UserId.Value, request.Role, cancellationToken);

        return new CreateEmployeeResultDto(result.UserId.Value, temporaryPassword);
    }
}
