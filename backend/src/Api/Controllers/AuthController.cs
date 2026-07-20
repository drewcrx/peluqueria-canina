using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PeluqueriaSaas.Api.Auth;
using PeluqueriaSaas.Application.Features.Auth.Common;
using PeluqueriaSaas.Application.Features.Auth.Login;
using PeluqueriaSaas.Application.Features.Auth.Logout;
using PeluqueriaSaas.Application.Features.Auth.Refresh;
using PeluqueriaSaas.Application.Features.Auth.RegisterTenant;

namespace PeluqueriaSaas.Api.Controllers;

public record RegisterTenantRequest(string CompanyName, string OwnerFullName, string OwnerEmail, string OwnerPassword);
public record LoginRequest(string Email, string Password);
public record AuthUserResponse(Guid UserId, string Email, string FullName, Guid? TenantId, string[] Roles);

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

    private AuthUserResponse SetSessionAndBuildResponse(AuthResultDto result)
    {
        AuthCookies.Set(Response, result, environment.IsDevelopment());
        return new AuthUserResponse(result.UserId, result.Email, result.FullName, result.TenantId, result.Roles);
    }
}
