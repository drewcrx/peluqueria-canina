using FluentValidation;
using MediatR;

namespace PeluqueriaSaas.Application.Features.Tenants.UpdateBusinessHours;

public record DayHoursInput(DayOfWeek DayOfWeek, bool IsOpen, TimeOnly? OpenTime, TimeOnly? CloseTime);

// Sin IFeatureGatedRequest a propósito: el horario de atención no es una funcionalidad premium,
// está disponible en cualquier plan — es la base del agendamiento desde el formulario público.
public record UpdateBusinessHoursCommand(int SlotDurationMinutes, IReadOnlyList<DayHoursInput> Days) : IRequest;

public class UpdateBusinessHoursCommandValidator : AbstractValidator<UpdateBusinessHoursCommand>
{
    public UpdateBusinessHoursCommandValidator()
    {
        RuleFor(x => x.SlotDurationMinutes).InclusiveBetween(15, 240);
        RuleFor(x => x.Days).Must(days => days.Select(d => d.DayOfWeek).Distinct().Count() == 7)
            .WithMessage("Debes enviar los 7 días de la semana, sin repetir.");
        RuleForEach(x => x.Days).ChildRules(day =>
        {
            day.RuleFor(d => d.OpenTime).NotNull().When(d => d.IsOpen)
                .WithMessage("Falta la hora de apertura.");
            day.RuleFor(d => d.CloseTime).NotNull().When(d => d.IsOpen)
                .WithMessage("Falta la hora de cierre.");
            day.RuleFor(d => d)
                .Must(d => !d.IsOpen || !d.OpenTime.HasValue || !d.CloseTime.HasValue || d.CloseTime > d.OpenTime)
                .WithMessage("La hora de cierre debe ser posterior a la de apertura.");
        });
    }
}
