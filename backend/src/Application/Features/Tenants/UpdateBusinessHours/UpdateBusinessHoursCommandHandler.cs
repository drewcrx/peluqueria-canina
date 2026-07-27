using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Tenants.UpdateBusinessHours;

public class UpdateBusinessHoursCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<UpdateBusinessHoursCommand>
{
    public async Task Handle(UpdateBusinessHoursCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();

        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        var existingDays = await db.BusinessHours
            .Where(b => b.TenantId == tenantId)
            .ToListAsync(cancellationToken);

        foreach (var input in request.Days)
        {
            var existing = existingDays.FirstOrDefault(d => d.DayOfWeek == input.DayOfWeek);
            if (existing is not null)
            {
                existing.Update(input.IsOpen, input.OpenTime, input.CloseTime);
            }
            else
            {
                db.BusinessHours.Add(BusinessHours.Create(tenantId, input.DayOfWeek, input.IsOpen, input.OpenTime, input.CloseTime));
            }
        }

        tenant.SetSlotDurationMinutes(request.SlotDurationMinutes);
        await db.SaveChangesAsync(cancellationToken);
    }
}
