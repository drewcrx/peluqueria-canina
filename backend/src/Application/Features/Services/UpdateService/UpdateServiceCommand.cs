using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Services.UpdateService;

public record UpdateServiceCommand(Guid ServiceId, string Name, bool IsActive) : IRequest;

public class UpdateServiceCommandValidator : AbstractValidator<UpdateServiceCommand>
{
    public UpdateServiceCommandValidator()
    {
        RuleFor(x => x.ServiceId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class UpdateServiceCommandHandler(IApplicationDbContext db) : IRequestHandler<UpdateServiceCommand>
{
    public async Task Handle(UpdateServiceCommand request, CancellationToken cancellationToken)
    {
        var service = await db.Services.FirstOrDefaultAsync(s => s.Id == request.ServiceId, cancellationToken)
            ?? throw new NotFoundException("Servicio no encontrado.");

        service.Rename(request.Name);
        if (request.IsActive)
        {
            service.Activate();
        }
        else
        {
            service.Deactivate();
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
