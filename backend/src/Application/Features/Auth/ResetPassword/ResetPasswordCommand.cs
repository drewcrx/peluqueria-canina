using FluentValidation;
using MediatR;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Auth.ResetPassword;

public record ResetPasswordCommand(string Email, string Token, string NewPassword) : IRequest;

public class ResetPasswordCommandValidator : AbstractValidator<ResetPasswordCommand>
{
    public ResetPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Token).NotEmpty();
        RuleFor(x => x.NewPassword).MinimumLength(8).WithMessage("La nueva contraseña debe tener al menos 8 caracteres.");
    }
}

public class ResetPasswordCommandHandler(IIdentityService identityService) : IRequestHandler<ResetPasswordCommand>
{
    public async Task Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        var result = await identityService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword, cancellationToken);
        if (!result.Succeeded)
        {
            throw new PeluqueriaSaas.Application.Common.Exceptions.ValidationException(
                result.Errors.Select(e => new FluentValidation.Results.ValidationFailure(nameof(request.Token), e)));
        }
    }
}
