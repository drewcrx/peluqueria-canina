using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Pets.UpdatePetPhoto;

// Sin IFeatureGatedRequest a propósito: la foto de identificación de la mascota no es una
// funcionalidad premium, está disponible en cualquier plan.
public record UpdatePetPhotoCommand(Guid PetId, StoredFile Photo) : IRequest<string>;

public class UpdatePetPhotoCommandValidator : AbstractValidator<UpdatePetPhotoCommand>
{
    public UpdatePetPhotoCommandValidator()
    {
        RuleFor(x => x.Photo)
            .Must(p => AllowedImageTypes.IsAllowed(p.ContentType, p.FileName))
            .WithMessage("Solo se permiten imágenes JPG, PNG, WEBP o GIF.");
    }
}

public class UpdatePetPhotoCommandHandler(IApplicationDbContext db, IFileStorage fileStorage, ITenantContext tenantContext)
    : IRequestHandler<UpdatePetPhotoCommand, string>
{
    public async Task<string> Handle(UpdatePetPhotoCommand request, CancellationToken cancellationToken)
    {
        var pet = await db.Pets.FirstOrDefaultAsync(p => p.Id == request.PetId, cancellationToken)
            ?? throw new NotFoundException("Mascota no encontrada.");

        var tenantId = tenantContext.RequireTenantId();
        var photoUrl = await fileStorage.SaveAsync(tenantId, request.Photo, cancellationToken);

        pet.SetPhotoUrl(photoUrl);
        await db.SaveChangesAsync(cancellationToken);

        return photoUrl;
    }
}
