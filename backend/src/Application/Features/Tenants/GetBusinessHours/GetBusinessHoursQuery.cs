using MediatR;

namespace PeluqueriaSaas.Application.Features.Tenants.GetBusinessHours;

public record GetBusinessHoursQuery : IRequest<BusinessHoursDto>;

public record DayHoursDto(DayOfWeek DayOfWeek, bool IsOpen, TimeOnly? OpenTime, TimeOnly? CloseTime);

public record BusinessHoursDto(int SlotDurationMinutes, IReadOnlyList<DayHoursDto> Days);
