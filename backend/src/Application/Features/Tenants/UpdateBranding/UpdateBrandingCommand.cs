using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Tenants.UpdateBranding;

// Sin IFeatureGatedRequest a propósito: el nombre y la marca del negocio no son una
// funcionalidad premium, están disponibles en cualquier plan.
public record UpdateBrandingCommand(string Name, string? BrandColor) : IRequest;

public class UpdateBrandingCommandValidator : AbstractValidator<UpdateBrandingCommand>
{
    public UpdateBrandingCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.BrandColor)
            .Matches("^#[0-9a-fA-F]{6}$")
            .When(x => !string.IsNullOrWhiteSpace(x.BrandColor))
            .WithMessage("El color debe ser un hexadecimal válido, por ejemplo #C17A56.");
    }
}

public class UpdateBrandingCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateBrandingCommand>
{
    public async Task Handle(UpdateBrandingCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        tenant.Rename(request.Name.Trim());
        tenant.SetBrandColor(string.IsNullOrWhiteSpace(request.BrandColor) ? null : request.BrandColor.Trim());
        await db.SaveChangesAsync(cancellationToken);
    }
}
