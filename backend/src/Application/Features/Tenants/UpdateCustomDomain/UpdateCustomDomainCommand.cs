using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Tenants.UpdateCustomDomain;

public record UpdateCustomDomainCommand(string? CustomDomainRequested) : IRequest, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.CustomDomain;
}

public class UpdateCustomDomainCommandValidator : AbstractValidator<UpdateCustomDomainCommand>
{
    public UpdateCustomDomainCommandValidator()
    {
        RuleFor(x => x.CustomDomainRequested).MaximumLength(255);
    }
}

public class UpdateCustomDomainCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateCustomDomainCommand>
{
    public async Task Handle(UpdateCustomDomainCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        tenant.SetCustomDomainRequested(
            string.IsNullOrWhiteSpace(request.CustomDomainRequested) ? null : request.CustomDomainRequested.Trim());
        await db.SaveChangesAsync(cancellationToken);
    }
}
