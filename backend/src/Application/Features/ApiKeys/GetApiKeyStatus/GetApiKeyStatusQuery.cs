using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.ApiKeys.GetApiKeyStatus;

public record GetApiKeyStatusQuery : IRequest<ApiKeyStatusDto>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Api;
}

public record ApiKeyStatusDto(bool HasActiveKey, string? MaskedPreview, DateTime? CreatedAt, DateTime? LastUsedAt);

public class GetApiKeyStatusQueryHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetApiKeyStatusQuery, ApiKeyStatusDto>
{
    public async Task<ApiKeyStatusDto> Handle(GetApiKeyStatusQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();

        var activeKey = await db.ApiKeys
            .Where(k => k.TenantId == tenantId && k.RevokedAt == null)
            .OrderByDescending(k => k.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        return activeKey is null
            ? new ApiKeyStatusDto(false, null, null, null)
            : new ApiKeyStatusDto(true, activeKey.MaskedPreview, activeKey.CreatedAt, activeKey.LastUsedAt);
    }
}
