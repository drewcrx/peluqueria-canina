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

        // SameSite=None solo es válido (y solo lo respetan los navegadores/webviews) junto con
        // Secure — necesario para que la sesión funcione desde el origen distinto de la app
        // empaquetada con Capacitor (capacitor://localhost / https://localhost) hacia el backend
        // real. En Development seguimos en Lax porque ahí todo es same-origin vía el proxy de Vite.
        var sameSite = secure ? SameSiteMode.None : SameSiteMode.Lax;

        response.Cookies.Append(AccessTokenCookie, result.AccessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = sameSite,
            Expires = result.AccessTokenExpiresAt,
            Path = "/"
        });

        response.Cookies.Append(RefreshTokenCookie, result.RefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = secure,
            SameSite = sameSite,
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
