using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Tenants.UploadLogo;

// Sin IFeatureGatedRequest a propósito: subir tu propio logo no es una funcionalidad premium.
public record UploadLogoCommand(StoredFile Logo) : IRequest<string>;

public class UploadLogoCommandValidator : AbstractValidator<UploadLogoCommand>
{
    public UploadLogoCommandValidator()
    {
        RuleFor(x => x.Logo)
            .Must(p => AllowedImageTypes.IsAllowed(p.ContentType, p.FileName))
            .WithMessage("Solo se permiten imágenes JPG, PNG, WEBP o GIF.");
    }
}

public class UploadLogoCommandHandler(IApplicationDbContext db, IFileStorage fileStorage, ITenantContext tenantContext)
    : IRequestHandler<UploadLogoCommand, string>
{
    public async Task<string> Handle(UploadLogoCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        var logoUrl = await fileStorage.SaveAsync(tenantId, request.Logo, cancellationToken);
        tenant.SetLogoUrl(logoUrl);
        await db.SaveChangesAsync(cancellationToken);

        return logoUrl;
    }
}
