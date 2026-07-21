using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.ApiKeys.GenerateApiKey;

public record GenerateApiKeyCommand : IRequest<string>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Api;
}

public class GenerateApiKeyCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GenerateApiKeyCommand, string>
{
    public async Task<string> Handle(GenerateApiKeyCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();

        var activeKeys = await db.ApiKeys.Where(k => k.TenantId == tenantId && k.RevokedAt == null).ToListAsync(cancellationToken);
        foreach (var key in activeKeys)
        {
            key.Revoke();
        }

        var (rawKey, hash, maskedPreview) = ApiKeyGenerator.Generate();
        db.ApiKeys.Add(ApiKey.Create(tenantId, hash, maskedPreview));

        await db.SaveChangesAsync(cancellationToken);

        return rawKey;
    }
}
