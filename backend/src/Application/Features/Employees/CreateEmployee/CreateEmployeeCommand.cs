using FluentValidation;
using MediatR;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using ValidationException = PeluqueriaSaas.Application.Common.Exceptions.ValidationException;

namespace PeluqueriaSaas.Application.Features.Employees.CreateEmployee;

public record CreateEmployeeCommand(string FullName, string Email) : IRequest<CreateEmployeeResultDto>;

public record CreateEmployeeResultDto(Guid UserId, string TemporaryPassword);

public class CreateEmployeeCommandValidator : AbstractValidator<CreateEmployeeCommand>
{
    public CreateEmployeeCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
    }
}

public class CreateEmployeeCommandHandler(
    IIdentityService identityService, IEntitlementService entitlementService, ITenantContext tenantContext)
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

        await identityService.AddToRoleAsync(result.UserId.Value, RoleNames.Employee, cancellationToken);

        return new CreateEmployeeResultDto(result.UserId.Value, temporaryPassword);
    }
}
