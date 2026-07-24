using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Auth.ChangePassword;
using PeluqueriaSaas.Application.Features.Auth.Common;
using PeluqueriaSaas.Application.Features.Auth.ForgotPassword;
using PeluqueriaSaas.Application.Features.Auth.Login;
using PeluqueriaSaas.Application.Features.Auth.Logout;
using PeluqueriaSaas.Application.Features.Auth.Refresh;
using PeluqueriaSaas.Application.Features.Auth.RegisterTenant;
using PeluqueriaSaas.Application.Features.Auth.ResetPassword;

namespace PeluqueriaSaas.Api.Controllers;

public record RegisterTenantRequest(string CompanyName, string OwnerFullName, string OwnerEmail, string OwnerPassword);
public record LoginRequest(string Email, string Password);
public record AuthUserResponse(Guid UserId, string Email, string FullName, Guid? TenantId, string[] Roles);
public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
public record ForgotPasswordRequest(string Email);
public record ForgotPasswordResponse(bool Sent, string? ResetToken, string? ResetUrl);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);

[ApiController]
[Route("api/auth")]
public class AuthController(ISender mediator, IWebHostEnvironment environment) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthUserResponse>> Register(RegisterTenantRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new RegisterTenantCommand(request.CompanyName, request.OwnerFullName, request.OwnerEmail, request.OwnerPassword),
            cancellationToken);

        return Ok(SetSessionAndBuildResponse(result));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthUserResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new LoginCommand(request.Email, request.Password), cancellationToken);
        return Ok(SetSessionAndBuildResponse(result));
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthUserResponse>> Refresh(CancellationToken cancellationToken)
    {
        var rawRefreshToken = Request.Cookies[AuthCookies.RefreshTokenCookie];
        if (string.IsNullOrEmpty(rawRefreshToken))
        {
            return Unauthorized(new { message = "No hay una sesión para renovar." });
        }

        var result = await mediator.Send(new RefreshTokenCommand(rawRefreshToken), cancellationToken);
        return Ok(SetSessionAndBuildResponse(result));
    }

    /// <summary>
    /// Lets the SPA restore session state on page reload from the httpOnly cookie alone —
    /// works for both worlds (tenant user or Platform Admin), unlike /api/tenant/me which
    /// requires the TenantUser policy specifically.
    /// </summary>
    [Authorize]
    [HttpGet("me")]
    public ActionResult<AuthUserResponse> Me()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);
        var email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email")!;
        var fullName = User.FindFirstValue(ClaimTypes.Name) ?? User.FindFirstValue("name") ?? email;
        var tenantIdClaim = User.FindFirstValue("tenant_id");
        var tenantId = tenantIdClaim is null ? (Guid?)null : Guid.Parse(tenantIdClaim);
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray();

        return Ok(new AuthUserResponse(userId, email, fullName, tenantId, roles));
    }

    [AllowAnonymous]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var rawRefreshToken = Request.Cookies[AuthCookies.RefreshTokenCookie];
        if (!string.IsNullOrEmpty(rawRefreshToken))
        {
            await mediator.Send(new LogoutCommand(rawRefreshToken), cancellationToken);
        }

        AuthCookies.Clear(Response);
        return NoContent();
    }

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new ChangePasswordCommand(request.CurrentPassword, request.NewPassword), cancellationToken);
        return NoContent();
    }

    [AllowAnonymous]
    [EnableRateLimiting(RateLimiterPolicies.PasswordReset)]
    [HttpPost("forgot-password")]
    public async Task<ActionResult<ForgotPasswordResponse>> ForgotPassword(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ForgotPasswordCommand(request.Email), cancellationToken);

        // El token/enlace solo viaja al cliente fuera de Producción — no hay envío de correo real
        // todavía (ver IEmailSender), así que esto reemplaza a "revisa tu bandeja de entrada" en dev,
        // igual que la contraseña temporal de un empleado se muestra una vez en un modal.
        return Ok(environment.IsDevelopment()
            ? new ForgotPasswordResponse(result.Sent, result.ResetToken, result.ResetUrl)
            : new ForgotPasswordResponse(result.Sent, null, null));
    }

    [AllowAnonymous]
    [EnableRateLimiting(RateLimiterPolicies.PasswordReset)]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await mediator.Send(new ResetPasswordCommand(request.Email, request.Token, request.NewPassword), cancellationToken);
        return NoContent();
    }

    private AuthUserResponse SetSessionAndBuildResponse(AuthResultDto result)
    {
        AuthCookies.Set(Response, result, environment.IsDevelopment());
        return new AuthUserResponse(result.UserId, result.Email, result.FullName, result.TenantId, result.Roles);
    }
}
