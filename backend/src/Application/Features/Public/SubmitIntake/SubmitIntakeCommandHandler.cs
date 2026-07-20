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

        var pet = Pet.Create(
            tenant.Id,
            client.Id,
            request.PetName,
            request.BreedId,
            request.PetSex,
            request.PetAgeYears,
            request.PetWeightKg,
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

        // Sin fecha: aparece en la Agenda bajo "Por agendar" para que el dueño confirme cuándo.
        var appointment = Appointment.Create(
            tenant.Id, client.Id, pet.Id, scheduledAt: null, notes: request.Observations, request.RequestedServiceIds);
        db.Appointments.Add(appointment);

        var notification = Notification.Create(
            tenant.Id, $"{client.FullName} registró a {pet.Name} a través del formulario público.");
        db.Notifications.Add(notification);

        await db.SaveChangesAsync(cancellationToken);

        return new SubmitIntakeResultDto(client.Id, pet.Id, client.FullName, pet.Name);
    }
}
