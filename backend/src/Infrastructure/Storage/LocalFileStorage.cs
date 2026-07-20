using Microsoft.Extensions.Hosting;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Infrastructure.Storage;

/// <summary>
/// Saves to disk under {ContentRoot}/App_Data/uploads/{tenantId}/. Served back to the browser
/// via static files middleware mapped to the "/uploads" URL prefix (see Program.cs). Swap for a
/// Cloudinary-backed IFileStorage implementation once there's a paying client and a production
/// deploy to justify the cost — nothing else in the app needs to change.
/// </summary>
public class LocalFileStorage(IHostEnvironment environment) : IFileStorage
{
    private const string UploadsFolderName = "uploads";

    public async Task<string> SaveAsync(Guid tenantId, StoredFile file, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(file.FileName);
        var safeFileName = $"{Guid.NewGuid()}{extension}";

        var tenantFolder = Path.Combine(environment.ContentRootPath, "App_Data", UploadsFolderName, tenantId.ToString());
        Directory.CreateDirectory(tenantFolder);

        var fullPath = Path.Combine(tenantFolder, safeFileName);
        await using var destination = File.Create(fullPath);
        await file.Content.CopyToAsync(destination, cancellationToken);

        return $"/{UploadsFolderName}/{tenantId}/{safeFileName}";
    }
}
