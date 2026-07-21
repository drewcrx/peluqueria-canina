using MediatR;

namespace PeluqueriaSaas.Application.Features.Appointments.ListAppointments;

public record ListAppointmentsQuery(string? Status) : IRequest<IReadOnlyList<AppointmentSummaryDto>>;

public record AppointmentSummaryDto(
    Guid Id,
    Guid ClientId,
    string ClientFullName,
    Guid PetId,
    string PetName,
    DateTime? ScheduledAt,
    string Status,
    string? Notes,
    DateTime? ReminderSentAt,
    IReadOnlyList<string> ServiceNames);
