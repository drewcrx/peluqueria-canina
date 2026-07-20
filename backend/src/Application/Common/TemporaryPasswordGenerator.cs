using System.Security.Cryptography;

namespace PeluqueriaSaas.Application.Common;

public static class TemporaryPasswordGenerator
{
    // Sin caracteres ambiguos (0/O, 1/l/I) — el dueño se la va a leer o escribir a mano al empleado.
    private const string Alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

    public static string Generate(int length = 10)
    {
        var chars = new char[length];
        for (var i = 0; i < length; i++)
        {
            chars[i] = Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)];
        }
        return new string(chars);
    }
}
