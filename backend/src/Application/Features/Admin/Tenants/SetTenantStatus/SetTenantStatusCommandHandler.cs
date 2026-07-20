using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Admin.Tenants.SetTenantStatus;

public class SetTenantStatusCommandHandler(IApplicationDbContext db) : IRequestHandler<SetTenantStatusCommand>
{
    public async Task Handle(SetTenantStatusCommand request, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        if (request.Suspend)
        {
            tenant.Suspend();
        }
        else
        {
            tenant.Reactivate();
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
