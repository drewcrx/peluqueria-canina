using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Clients.ListClients;

public class ListClientsQueryHandler(IApplicationDbContext db) : IRequestHandler<ListClientsQuery, IReadOnlyList<ClientSummaryDto>>
{
    public async Task<IReadOnlyList<ClientSummaryDto>> Handle(ListClientsQuery request, CancellationToken cancellationToken)
    {
        return await db.Clients
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new ClientSummaryDto(c.Id, c.FullName, c.Phone, c.Email, c.Pets.Count, c.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
