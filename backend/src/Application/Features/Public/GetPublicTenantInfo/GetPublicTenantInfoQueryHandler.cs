using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Public.GetPublicTenantInfo;

public class GetPublicTenantInfoQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetPublicTenantInfoQuery, PublicTenantInfoDto>
{
    public async Task<PublicTenantInfoDto> Handle(GetPublicTenantInfoQuery request, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.PublicFormSlug == request.Slug, cancellationToken)
            ?? throw new NotFoundException("Formulario no encontrado.");

        if (tenant.Status == TenantStatus.Suspended)
        {
            throw new NotFoundException("Formulario no encontrado.");
        }

        var breeds = await db.Breeds
            .OrderBy(b => b.Name)
            .Select(b => new PublicBreedDto(b.Id, b.Name))
            .ToListAsync(cancellationToken);

        // IgnoreQueryFilters: petición anónima resolviendo el catálogo de OTRO tenant (el dueño
        // del formulario), no el propio — el filtro global de tenant no aplica a este caso de uso.
        var services = await db.Services
            .IgnoreQueryFilters()
            .Where(s => s.TenantId == tenant.Id && s.IsActive)
            .OrderBy(s => s.Name)
            .Select(s => new PublicServiceDto(s.Id, s.Name))
            .ToListAsync(cancellationToken);

        return new PublicTenantInfoDto(tenant.Id, tenant.Name, breeds, services, tenant.LogoUrl, tenant.BrandColor);
    }
}
