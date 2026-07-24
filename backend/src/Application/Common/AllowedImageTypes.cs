namespace PeluqueriaSaas.Application.Common;

/// <summary>
/// Shared allowlist for image uploads (appointment photos, tenant logos, public intake photos).
/// Checking the client-supplied Content-Type is not a real content guarantee — it is trivially
/// spoofable — but combined with the matching extension check and the static-file server's own
/// extension allowlist (see Program.cs), it closes off the realistic stored-XSS path: a spoofed
/// upload can at worst end up served back with an image Content-Type, which browsers don't
/// execute as script.
/// </summary>
public static class AllowedImageTypes
{
    public static readonly string[] ContentTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    public static readonly string[] Extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    public static bool IsAllowed(string contentType, string fileName) =>
        ContentTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase)
        && Extensions.Contains(Path.GetExtension(fileName), StringComparer.OrdinalIgnoreCase);
}
