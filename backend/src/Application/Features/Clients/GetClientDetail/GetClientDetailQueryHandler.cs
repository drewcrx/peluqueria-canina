using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Clients.GetClientDetail;

public class GetClientDetailQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetClientDetailQuery, ClientDetailDto>
{
    public async Task<ClientDetailDto> Handle(GetClientDetailQuery request, CancellationToken cancellationToken)
    {
        var client = await db.Clients.FirstOrDefaultAsync(c => c.Id == request.ClientId, cancellationToken)
            ?? throw new NotFoundException("Cliente no encontrado.");

        var pets = await db.Pets
            .Where(p => p.ClientId == client.Id)
            .Join(db.Breeds, p => p.BreedId, b => b.Id, (p, b) => new PetSummaryDto(p.Id, p.Name, b.Name, p.Sex.ToString(), p.AgeYears))
            .ToListAsync(cancellationToken);

        return new ClientDetailDto(client.Id, client.FullName, client.Phone, client.Email, client.Address, client.CreatedAt, pets);
    }
}
