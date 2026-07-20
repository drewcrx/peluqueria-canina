using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Appointments.CreateAppointment;

public record CreateAppointmentCommand(
    Guid ClientId, Guid PetId, DateTime? ScheduledAt, string? Notes, IReadOnlyList<Guid> ServiceIds) : IRequest<Guid>;

public class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
{
    public CreateAppointmentCommandValidator()
    {
        RuleFor(x => x.ClientId).NotEmpty();
        RuleFor(x => x.PetId).NotEmpty();
    }
}

public class CreateAppointmentCommandHandler(IApplicationDbContext db, ITenantContext tenantContext)
    : IRequestHandler<CreateAppointmentCommand, Guid>
{
    public async Task<Guid> Handle(CreateAppointmentCommand request, CancellationToken cancellationToken)
    {
        var petBelongsToClient = await db.Pets.AnyAsync(
            p => p.Id == request.PetId && p.ClientId == request.ClientId, cancellationToken);
        if (!petBelongsToClient)
        {
            throw new NotFoundException("La mascota no pertenece a ese cliente.");
        }

        var appointment = Appointment.Create(
            tenantContext.RequireTenantId(), request.ClientId, request.PetId, request.ScheduledAt, request.Notes, request.ServiceIds);

        db.Appointments.Add(appointment);
        await db.SaveChangesAsync(cancellationToken);

        return appointment.Id;
    }
}
