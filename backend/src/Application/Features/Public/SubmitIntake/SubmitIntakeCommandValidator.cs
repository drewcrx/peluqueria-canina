using FluentValidation;

namespace PeluqueriaSaas.Application.Features.Public.SubmitIntake;

public class SubmitIntakeCommandValidator : AbstractValidator<SubmitIntakeCommand>
{
    private const int MaxPhotos = 6;
    private static readonly string[] AllowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

    public SubmitIntakeCommandValidator()
    {
        RuleFor(x => x.Slug).NotEmpty();
        RuleFor(x => x.ClientFullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ClientPhone).NotEmpty().MinimumLength(7).MaximumLength(20);
        RuleFor(x => x.ClientEmail).EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.ClientEmail));
        RuleFor(x => x.PetName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BreedId).NotEmpty();
        RuleFor(x => x.PetAgeYears).InclusiveBetween(0, 40).When(x => x.PetAgeYears.HasValue);
        RuleFor(x => x.PetWeightKg).InclusiveBetween(0.1m, 150m).When(x => x.PetWeightKg.HasValue);
        RuleFor(x => x.Photos).Must(p => p.Count <= MaxPhotos).WithMessage($"Máximo {MaxPhotos} fotos.");
        RuleForEach(x => x.Photos).Must(p => AllowedImageTypes.Contains(p.ContentType))
            .WithMessage("Solo se permiten imágenes JPG, PNG o WEBP.");
    }
}
