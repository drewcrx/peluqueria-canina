using FluentValidation;
using MediatR;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Auth.ForgotPassword;

public record ForgotPasswordCommand(string Email) : IRequest<ForgotPasswordResultDto>;

/// <summary>
/// ResetToken/ResetUrl always come back populated when the email exists — there is no real email
/// delivery yet (see IEmailSender, which only logs), so the caller carries the value the "email"
/// would have contained. The Api layer (AuthController, same as it already does for
/// IWebHostEnvironment.IsDevelopment() elsewhere) is responsible for stripping these two fields
/// out of the HTTP response outside Development, mirroring the temporary employee password shown
/// once in a modal.
/// </summary>
public record ForgotPasswordResultDto(bool Sent, string? ResetToken, string? ResetUrl);

public class ForgotPasswordCommandValidator : AbstractValidator<ForgotPasswordCommand>
{
    public ForgotPasswordCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class ForgotPasswordCommandHandler(IIdentityService identityService, IEmailSender emailSender)
    : IRequestHandler<ForgotPasswordCommand, ForgotPasswordResultDto>
{
    public async Task<ForgotPasswordResultDto> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
    {
        var token = await identityService.GeneratePasswordResetTokenAsync(request.Email, cancellationToken);

        // Nunca revelamos si el correo existe o no — siempre "Sent = true" del lado del cliente.
        if (token is null)
        {
            return new ForgotPasswordResultDto(true, null, null);
        }

        await emailSender.SendAsync(
            request.Email,
            "Recupera tu contraseña — AUREA Pet Spa",
            $"Usa este código para restablecer tu contraseña: {token}",
            cancellationToken);

        var resetUrl = $"/restablecer-contrasena?email={Uri.EscapeDataString(request.Email)}&token={Uri.EscapeDataString(token)}";
        return new ForgotPasswordResultDto(true, token, resetUrl);
    }
}
