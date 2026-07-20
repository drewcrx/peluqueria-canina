namespace PeluqueriaSaas.Application.Common.Interfaces;

public record StoredFile(string FileName, Stream Content, string ContentType);

/// <summary>
/// Decoupled the same way as payments/notifications: local disk implementation now (see
/// Infrastructure/Storage/LocalFileStorage), Cloudinary implements this same interface when
/// there's a paying client and a production deploy to justify the cost.
/// </summary>
public interface IFileStorage
{
    /// <returns>A public-facing relative URL (e.g. "/uploads/{tenantId}/{fileName}") clients can load directly.</returns>
    Task<string> SaveAsync(Guid tenantId, StoredFile file, CancellationToken cancellationToken = default);
}
