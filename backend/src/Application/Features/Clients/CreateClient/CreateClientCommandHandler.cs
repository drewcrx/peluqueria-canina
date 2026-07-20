using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Clients.CreateClient;

public class CreateClientCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateClientCommand, Guid>
{
    public async Task<Guid> Handle(CreateClientCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();
        var normalizedPhone = PhoneNumberNormalizer.Normalize(request.Phone);

        var exists = await db.Clients.AnyAsync(c => c.Phone == normalizedPhone, cancellationToken);
        if (exists)
        {
            throw new ConflictException("Ya existe un cliente registrado con este teléfono.");
        }

        var client = Client.Create(tenantId, request.FullName, normalizedPhone, request.Email, request.Address);
        db.Clients.Add(client);
        await db.SaveChangesAsync(cancellationToken);

        return client.Id;
    }
}
