using FluentValidation;
using MediatR;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Auth.ChangePassword;

public record ChangePasswordCommand(string CurrentPassword, string NewPassword) : IRequest;

public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).MinimumLength(8).WithMessage("La nueva contraseña debe tener al menos 8 caracteres.");
    }
}

public class ChangePasswordCommandHandler(IIdentityService identityService, ICurrentUserService currentUser)
    : IRequestHandler<ChangePasswordCommand>
{
    public async Task Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new AuthenticationException("No hay una sesión activa.");

        var result = await identityService.ChangePasswordAsync(userId, request.CurrentPassword, request.NewPassword, cancellationToken);
        if (!result.Succeeded)
        {
            throw new PeluqueriaSaas.Application.Common.Exceptions.ValidationException(
                result.Errors.Select(e => new FluentValidation.Results.ValidationFailure(nameof(request.CurrentPassword), e)));
        }
    }
}
