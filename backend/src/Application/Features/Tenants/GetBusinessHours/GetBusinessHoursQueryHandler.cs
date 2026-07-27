using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Tenants.GetBusinessHours;

public class GetBusinessHoursQueryHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<GetBusinessHoursQuery, BusinessHoursDto>
{
    public async Task<BusinessHoursDto> Handle(GetBusinessHoursQuery request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();

        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        var days = await db.BusinessHours
            .Where(b => b.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        // Defensivo: tenants creados antes de que existiera esta funcionalidad no tienen filas
        // sembradas — se completan con "cerrado" en vez de fallar.
        var dayDtos = Enum.GetValues<DayOfWeek>().Select(day =>
        {
            var match = days.FirstOrDefault(d => d.DayOfWeek == day);
            return match is null
                ? new DayHoursDto(day, false, null, null)
                : new DayHoursDto(match.DayOfWeek, match.IsOpen, match.OpenTime, match.CloseTime);
        }).ToList();

        return new BusinessHoursDto(tenant.SlotDurationMinutes, dayDtos);
    }
}
