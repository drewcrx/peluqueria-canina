using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Public.GetPetCard;

public class GetPetCardQueryHandler(IApplicationDbContext db) : IRequestHandler<GetPetCardQuery, PetCardDto>
{
    private const int MaxRecentVisits = 5;

    public async Task<PetCardDto> Handle(GetPetCardQuery request, CancellationToken cancellationToken)
    {
        // IgnoreQueryFilters: esta consulta se sirve de forma anónima (código QR escaneado por
        // cualquiera), sin contexto de tenant resuelto, así que el filtro global no aplica.
        var pet = await db.Pets
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.PetId, cancellationToken)
            ?? throw new NotFoundException("Mascota no encontrada.");

        var breedName = await db.Breeds.Where(b => b.Id == pet.BreedId).Select(b => b.Name).FirstOrDefaultAsync(cancellationToken)
            ?? "—";

        var client = await db.Clients
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == pet.ClientId, cancellationToken)
            ?? throw new NotFoundException("Cliente no encontrado.");

        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == pet.TenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        var appointments = await db.Appointments
            .IgnoreQueryFilters()
            .Where(a => a.PetId == pet.Id && a.Status == AppointmentStatus.Completed)
            .OrderByDescending(a => a.CompletedAt ?? a.ScheduledAt ?? a.CreatedAt)
            .Take(MaxRecentVisits)
            .ToListAsync(cancellationToken);

        var appointmentIds = appointments.Select(a => a.Id).ToList();
        var serviceNamesByAppointment = await db.AppointmentServices
            .IgnoreQueryFilters()
            .Where(aps => appointmentIds.Contains(aps.AppointmentId))
            .Join(db.Services.IgnoreQueryFilters(), aps => aps.ServiceId, s => s.Id, (aps, s) => new { aps.AppointmentId, ServiceName = s.Name })
            .ToListAsync(cancellationToken);

        var recentVisits = appointments.Select(a => new PetCardVisitDto(
            a.CompletedAt ?? a.ScheduledAt ?? a.CreatedAt,
            [.. serviceNamesByAppointment.Where(s => s.AppointmentId == a.Id).Select(s => s.ServiceName)]))
            .ToList();

        return new PetCardDto(
            pet.Id, pet.Name, breedName, pet.Sex.ToString(), pet.AgeYears, pet.WeightKg,
            pet.Color, pet.PhotoUrl,
            pet.Vaccines, pet.Diseases, pet.Medications, pet.Allergies,
            client.FullName, client.Phone,
            tenant.Name, tenant.LogoUrl, tenant.BrandColor,
            recentVisits);
    }
}
