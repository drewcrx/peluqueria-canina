using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Api.Auth;

public static class ApiKeyAuthenticationDefaults
{
    public const string Scheme = "ApiKey";
    public const string HeaderName = "X-Api-Key";
}

/// <summary>
/// Authenticates Pro-tenant requests to /api/v1 via the X-Api-Key header — the programmatic
/// counterpart to the JWT cookie the SPA uses. Sets the same "tenant_id" claim TenantResolutionMiddleware
/// already reads, so nothing downstream needs to know which scheme authenticated the request.
/// </summary>
public class ApiKeyAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IApplicationDbContext db)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(ApiKeyAuthenticationDefaults.HeaderName, out var headerValues))
        {
            return AuthenticateResult.NoResult();
        }

        var rawKey = headerValues.ToString();
        if (string.IsNullOrWhiteSpace(rawKey))
        {
            return AuthenticateResult.NoResult();
        }

        var hash = ApiKeyGenerator.Hash(rawKey);
        var apiKey = await db.ApiKeys.FirstOrDefaultAsync(k => k.KeyHash == hash && k.RevokedAt == null);

        if (apiKey is null)
        {
            return AuthenticateResult.Fail("Clave de API inválida o revocada.");
        }

        apiKey.MarkUsed();
        await db.SaveChangesAsync(CancellationToken.None);

        var claims = new[] { new Claim("tenant_id", apiKey.TenantId.ToString()) };
        var identity = new ClaimsIdentity(claims, ApiKeyAuthenticationDefaults.Scheme);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, ApiKeyAuthenticationDefaults.Scheme);

        return AuthenticateResult.Success(ticket);
    }
}
