using PeluqueriaSaas.Application.Features.Auth.Common;

namespace PeluqueriaSaas.Api.Auth;

/// <summary>
/// Centralizes how the JWT session lives in the browser: httpOnly cookies, never readable by
/// JS (mitigates token theft via XSS). Refresh token is scoped to /api/auth so no other endpoint
/// ever sees it. See README/architecture notes for why cookies were chosen over localStorage.
/// </summary>
public static class AuthCookies
{
    public const string AccessTokenCookie = "access_token";
    public const string RefreshTokenCookie = "refresh_token";

    public static void Set(HttpResponse response, AuthResultDto result, bool isDevelopment)
    {
        var secure = !isDevelopment;

        response.Cookies.Append(AccessTokenCookie, result.AccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = SameSiteMode.Lax,
            Expires = result.AccessTokenExpiresAt,
            Path = "/"
        });

        response.Cookies.Append(RefreshTokenCookie, result.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = SameSiteMode.Lax,
            Expires = result.RefreshTokenExpiresAt,
            Path = "/api/auth"
        });
    }

    public static void Clear(HttpResponse response)
    {
        response.Cookies.Delete(AccessTokenCookie, new CookieOptions { Path = "/" });
        response.Cookies.Delete(RefreshTokenCookie, new CookieOptions { Path = "/api/auth" });
    }
}
