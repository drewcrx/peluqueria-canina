using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Services.ListServices;

public class ListServicesQueryHandler(IApplicationDbContext db) : IRequestHandler<ListServicesQuery, IReadOnlyList<ServiceDto>>
{
    public async Task<IReadOnlyList<ServiceDto>> Handle(ListServicesQuery request, CancellationToken cancellationToken)
    {
        return await db.Services
            .OrderBy(s => s.Name)
            .Select(s => new ServiceDto(s.Id, s.Name, s.IsActive))
            .ToListAsync(cancellationToken);
    }
}
