using FluentValidation;
using MediatR;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Services.CreateService;

public class CreateServiceCommandValidator : AbstractValidator<CreateServiceCommand>
{
    public CreateServiceCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class CreateServiceCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateServiceCommand, Guid>
{
    public async Task<Guid> Handle(CreateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = Service.Create(tenantContext.RequireTenantId(), request.Name);
        db.Services.Add(service);
        await db.SaveChangesAsync(cancellationToken);
        return service.Id;
    }
}
