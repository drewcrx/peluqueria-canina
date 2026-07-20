using System.Text.RegularExpressions;

namespace PeluqueriaSaas.Application.Common;

public static partial class PhoneNumberNormalizer
{
    /// <summary>Digits only — used both for storage and for matching an existing client on a new submission.</summary>
    public static string Normalize(string phone) => DigitsOnlyRegex().Replace(phone, string.Empty);

    [GeneratedRegex(@"\D")]
    private static partial Regex DigitsOnlyRegex();
}
