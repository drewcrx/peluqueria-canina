using MediatR;

namespace PeluqueriaSaas.Application.Features.Public.GetPublicTenantInfo;

public record GetPublicTenantInfoQuery(string Slug) : IRequest<PublicTenantInfoDto>;

public record PublicBreedDto(Guid Id, string Name);
public record PublicServiceDto(Guid Id, string Name);

public record PublicTenantInfoDto(
    Guid TenantId,
    string TenantName,
    IReadOnlyList<PublicBreedDto> Breeds,
    IReadOnlyList<PublicServiceDto> Services,
    string? LogoUrl,
    string? BrandColor);
