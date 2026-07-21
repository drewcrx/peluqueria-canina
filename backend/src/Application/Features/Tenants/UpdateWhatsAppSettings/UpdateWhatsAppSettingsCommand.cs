using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Tenants.UpdateWhatsAppSettings;

public record UpdateWhatsAppSettingsCommand(string? WhatsAppNumber) : IRequest, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.WhatsApp;
}

public class UpdateWhatsAppSettingsCommandValidator : AbstractValidator<UpdateWhatsAppSettingsCommand>
{
    public UpdateWhatsAppSettingsCommandValidator()
    {
        RuleFor(x => x.WhatsAppNumber).MaximumLength(30);
    }
}

public class UpdateWhatsAppSettingsCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateWhatsAppSettingsCommand>
{
    public async Task Handle(UpdateWhatsAppSettingsCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        tenant.SetWhatsAppNumber(string.IsNullOrWhiteSpace(request.WhatsAppNumber) ? null : request.WhatsAppNumber.Trim());
        await db.SaveChangesAsync(cancellationToken);
    }
}
