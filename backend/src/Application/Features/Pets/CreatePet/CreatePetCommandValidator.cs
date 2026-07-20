using FluentValidation;

namespace PeluqueriaSaas.Application.Features.Pets.CreatePet;

public class CreatePetCommandValidator : AbstractValidator<CreatePetCommand>
{
    public CreatePetCommandValidator()
    {
        RuleFor(x => x.ClientId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BreedId).NotEmpty();
        RuleFor(x => x.AgeYears).InclusiveBetween(0, 40).When(x => x.AgeYears.HasValue);
        RuleFor(x => x.WeightKg).InclusiveBetween(0.1m, 150m).When(x => x.WeightKg.HasValue);
    }
}
