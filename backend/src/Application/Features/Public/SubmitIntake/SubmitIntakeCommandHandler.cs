using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Public.SubmitIntake;

public class SubmitIntakeCommandHandler(IApplicationDbContext db, IFileStorage fileStorage)
    : IRequestHandler<SubmitIntakeCommand, SubmitIntakeResultDto>
{
    public async Task<SubmitIntakeResultDto> Handle(SubmitIntakeCommand request, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.PublicFormSlug == request.Slug, cancellationToken)
            ?? throw new NotFoundException("Formulario no encontrado.");

        if (tenant.Status == TenantStatus.Suspended)
        {
            throw new NotFoundException("Formulario no encontrado.");
        }

        var normalizedPhone = PhoneNumberNormalizer.Normalize(request.ClientPhone);

        // IgnoreQueryFilters: petición anónima operando sobre el tenant DUEÑO del formulario,
        // no sobre "el tenant del request" (que no existe aquí).
        var client = await db.Clients
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.TenantId == tenant.Id && c.Phone == normalizedPhone, cancellationToken);

        if (client is null)
        {
            client = Client.Create(tenant.Id, request.ClientFullName, normalizedPhone, request.ClientEmail, request.ClientAddress);
            db.Clients.Add(client);
        }

        string? petPhotoUrl = request.PetPhoto is null ? null : await fileStorage.SaveAsync(tenant.Id, request.PetPhoto, cancellationToken);

        var pet = Pet.Create(
            tenant.Id,
            client.Id,
            request.PetName,
            request.BreedId,
            request.PetSex,
            request.PetAgeYears,
            request.PetWeightKg,
            request.PetColor,
            petPhotoUrl,
            request.Vaccines,
            request.Diseases,
            request.Medications,
            request.Allergies);
        db.Pets.Add(pet);

        var photoUrls = new List<string>();
        foreach (var photo in request.Photos)
        {
            photoUrls.Add(await fileStorage.SaveAsync(tenant.Id, photo, cancellationToken));
        }

        string? signatureUrl = null;
        if (request.Signature is not null)
        {
            signatureUrl = await fileStorage.SaveAsync(tenant.Id, request.Signature, cancellationToken);
        }

        var submission = IntakeSubmission.Create(
            tenant.Id, client.Id, pet.Id, request.Observations, photoUrls, signatureUrl, request.RequestedServiceIds);
        db.IntakeSubmissions.Add(submission);

        DateTime? scheduledAt = null;
        if (request.RequestedAt.HasValue)
        {
            // Re-chequeo contra condiciones de carrera: el horario pudo dejar de estar libre
            // entre que el cliente lo vio en el formulario y el momento en que envía. Si ya no
            // está disponible, la cita queda sin fecha en vez de fallar todo el envío.
            var date = DateOnly.FromDateTime(request.RequestedAt.Value);
            var dayHours = await db.BusinessHours
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.TenantId == tenant.Id && b.DayOfWeek == date.DayOfWeek, cancellationToken);

            var dayStart = date.ToDateTime(TimeOnly.MinValue);
            var dayEnd = dayStart.AddDays(1);
            var occupied = await db.Appointments
                .IgnoreQueryFilters()
                .Where(a => a.TenantId == tenant.Id && a.Status != AppointmentStatus.Cancelled
                    && a.ScheduledAt != null && a.ScheduledAt >= dayStart && a.ScheduledAt < dayEnd)
                .Select(a => a.ScheduledAt!.Value)
                .ToListAsync(cancellationToken);

            var availableSlots = AvailabilityCalculator.ComputeAvailableSlots(
                date, dayHours?.IsOpen ?? false, dayHours?.OpenTime, dayHours?.CloseTime,
                tenant.SlotDurationMinutes, occupied, DateTime.Now);

            if (availableSlots.Contains(TimeOnly.FromDateTime(request.RequestedAt.Value)))
            {
                // Sin SpecifyKind: se guarda como la misma hora local "naive" que usa el resto
                // del sistema (igual que ScheduleAppointmentCommand) — así el valor que vuelve en
                // la respuesta y el que ve el dueño en la Agenda siguen siendo la misma hora que
                // el cliente eligió, sin que el navegador la reinterprete como UTC y la desplace.
                scheduledAt = request.RequestedAt.Value;
            }
        }

        // Sin fecha: aparece en la Agenda bajo "Por agendar" para que el dueño confirme cuándo.
        var appointment = Appointment.Create(
            tenant.Id, client.Id, pet.Id, scheduledAt, notes: request.Observations, request.RequestedServiceIds);
        db.Appointments.Add(appointment);

        var notificationMessage = scheduledAt.HasValue
            ? $"{client.FullName} agendó una cita para {pet.Name} el {scheduledAt.Value:dd/MM/yyyy HH:mm}."
            : $"{client.FullName} registró a {pet.Name} a través del formulario público.";
        var notification = Notification.Create(tenant.Id, notificationMessage);
        db.Notifications.Add(notification);

        await db.SaveChangesAsync(cancellationToken);

        return new SubmitIntakeResultDto(client.Id, pet.Id, client.FullName, pet.Name, scheduledAt);
    }
}
