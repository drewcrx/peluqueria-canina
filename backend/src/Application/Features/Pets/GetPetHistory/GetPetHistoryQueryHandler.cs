using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Pets.GetPetHistory;

public class GetPetHistoryQueryHandler(IApplicationDbContext db) : IRequestHandler<GetPetHistoryQuery, PetHistoryDto>
{
    public async Task<PetHistoryDto> Handle(GetPetHistoryQuery request, CancellationToken cancellationToken)
    {
        var pet = await db.Pets.FirstOrDefaultAsync(p => p.Id == request.PetId, cancellationToken)
            ?? throw new NotFoundException("Mascota no encontrada.");

        var breedName = await db.Breeds.Where(b => b.Id == pet.BreedId).Select(b => b.Name).FirstOrDefaultAsync(cancellationToken)
            ?? "—";

        var client = await db.Clients.FirstOrDefaultAsync(c => c.Id == pet.ClientId, cancellationToken)
            ?? throw new NotFoundException("Cliente no encontrado.");

        var appointments = await db.Appointments
            .Where(a => a.PetId == pet.Id)
            .OrderByDescending(a => a.ScheduledAt ?? a.CreatedAt)
            .ToListAsync(cancellationToken);

        var appointmentIds = appointments.Select(a => a.Id).ToList();
        var serviceNamesByAppointment = await db.AppointmentServices
            .Where(aps => appointmentIds.Contains(aps.AppointmentId))
            .Join(db.Services, aps => aps.ServiceId, s => s.Id, (aps, s) => new { aps.AppointmentId, ServiceName = s.Name })
            .ToListAsync(cancellationToken);

        var photosByAppointment = await db.AppointmentPhotos
            .Where(p => appointmentIds.Contains(p.AppointmentId))
            .Select(p => new { p.AppointmentId, p.PhotoUrl })
            .ToListAsync(cancellationToken);

        var history = appointments.Select(a => new HistoryEntryDto(
            a.Id,
            a.ScheduledAt,
            a.Status.ToString(),
            a.Notes,
            a.CompletedAt,
            [.. serviceNamesByAppointment.Where(s => s.AppointmentId == a.Id).Select(s => s.ServiceName)],
            [.. photosByAppointment.Where(p => p.AppointmentId == a.Id).Select(p => p.PhotoUrl)]))
            .ToList();

        return new PetHistoryDto(
            pet.Id, pet.Name, breedName, pet.Sex.ToString(), pet.AgeYears, pet.WeightKg,
            pet.Vaccines, pet.Diseases, pet.Medications, pet.Allergies,
            client.FullName, client.Id, history);
    }
}
