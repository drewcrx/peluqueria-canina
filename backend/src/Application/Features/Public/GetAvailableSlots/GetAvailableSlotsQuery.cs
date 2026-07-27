using MediatR;

namespace PeluqueriaSaas.Application.Features.Public.GetAvailableSlots;

public record GetAvailableSlotsQuery(string Slug, DateOnly Date) : IRequest<AvailableSlotsDto>;

public record AvailableSlotsDto(int SlotDurationMinutes, IReadOnlyList<TimeOnly> Slots);
