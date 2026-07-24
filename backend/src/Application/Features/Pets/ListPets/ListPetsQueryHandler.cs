using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Pets.ListPets;

public class ListPetsQueryHandler(IApplicationDbContext db) : IRequestHandler<ListPetsQuery, IReadOnlyList<PetListItemDto>>
{
    public async Task<IReadOnlyList<PetListItemDto>> Handle(ListPetsQuery request, CancellationToken cancellationToken)
    {
        return await db.Pets
            .Join(db.Clients, p => p.ClientId, c => c.Id, (p, c) => new { Pet = p, Client = c })
            .Join(db.Breeds, pc => pc.Pet.BreedId, b => b.Id, (pc, b) => new { pc.Pet, pc.Client, Breed = b })
            .OrderByDescending(x => x.Pet.CreatedAt)
            .Select(x => new PetListItemDto(
                x.Pet.Id, x.Pet.Name, x.Breed.Name, x.Pet.Sex.ToString(), x.Pet.AgeYears, x.Pet.PhotoUrl,
                x.Client.Id, x.Client.FullName))
            .ToListAsync(cancellationToken);
    }
}
