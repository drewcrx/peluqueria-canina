using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Public.GetAvailableSlots;

public class GetAvailableSlotsQueryHandler(IApplicationDbContext db) : IRequestHandler<GetAvailableSlotsQuery, AvailableSlotsDto>
{
    public async Task<AvailableSlotsDto> Handle(GetAvailableSlotsQuery request, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.PublicFormSlug == request.Slug, cancellationToken)
            ?? throw new NotFoundException("Formulario no encontrado.");

        if (tenant.Status == TenantStatus.Suspended)
        {
            throw new NotFoundException("Formulario no encontrado.");
        }

        // IgnoreQueryFilters: petición anónima resolviendo datos de OTRO tenant (el dueño del
        // formulario), no el propio — el filtro global de tenant no aplica a este caso de uso.
        var dayHours = await db.BusinessHours
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.TenantId == tenant.Id && b.DayOfWeek == request.Date.DayOfWeek, cancellationToken);

        var dayStart = request.Date.ToDateTime(TimeOnly.MinValue);
        var dayEnd = dayStart.AddDays(1);

        var occupied = await db.Appointments
            .IgnoreQueryFilters()
            .Where(a => a.TenantId == tenant.Id && a.Status != AppointmentStatus.Cancelled
                && a.ScheduledAt != null && a.ScheduledAt >= dayStart && a.ScheduledAt < dayEnd)
            .Select(a => a.ScheduledAt!.Value)
            .ToListAsync(cancellationToken);

        var slots = AvailabilityCalculator.ComputeAvailableSlots(
            request.Date, dayHours?.IsOpen ?? false, dayHours?.OpenTime, dayHours?.CloseTime,
            tenant.SlotDurationMinutes, occupied, DateTime.Now);

        return new AvailableSlotsDto(tenant.SlotDurationMinutes, slots);
    }
}
