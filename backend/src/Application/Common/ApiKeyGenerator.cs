using System.Security.Cryptography;
using System.Text;

namespace PeluqueriaSaas.Application.Common;

public static class ApiKeyGenerator
{
    private const string KeyPrefix = "psaas_";

    public static (string RawKey, string Hash, string MaskedPreview) Generate()
    {
        var randomPart = Convert.ToBase64String(RandomNumberGenerator.GetBytes(24))
            .Replace('+', '-').Replace('/', '_').TrimEnd('=');
        var rawKey = $"{KeyPrefix}{randomPart}";
        var hash = Hash(rawKey);
        var maskedPreview = $"{rawKey[..(KeyPrefix.Length + 6)]}…{rawKey[^4..]}";
        return (rawKey, hash, maskedPreview);
    }

    public static string Hash(string rawKey) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawKey)));
}
