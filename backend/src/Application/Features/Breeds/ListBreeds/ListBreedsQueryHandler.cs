using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Breeds.ListBreeds;

public class ListBreedsQueryHandler(IApplicationDbContext db) : IRequestHandler<ListBreedsQuery, IReadOnlyList<BreedDto>>
{
    public async Task<IReadOnlyList<BreedDto>> Handle(ListBreedsQuery request, CancellationToken cancellationToken)
    {
        return await db.Breeds
            .OrderBy(b => b.Name)
            .Select(b => new BreedDto(b.Id, b.Name))
            .ToListAsync(cancellationToken);
    }
}
