using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Pets.CreatePet;

public class CreatePetCommandHandler(IApplicationDbContext db, IFileStorage fileStorage, ITenantContext tenantContext)
    : IRequestHandler<CreatePetCommand, Guid>
{
    public async Task<Guid> Handle(CreatePetCommand request, CancellationToken cancellationToken)
    {
        var tenantId = tenantContext.RequireTenantId();

        var clientExists = await db.Clients.AnyAsync(c => c.Id == request.ClientId, cancellationToken);
        if (!clientExists)
        {
            throw new NotFoundException("Cliente no encontrado.");
        }

        string? photoUrl = request.Photo is null ? null : await fileStorage.SaveAsync(tenantId, request.Photo, cancellationToken);

        var pet = Pet.Create(
            tenantId,
            request.ClientId,
            request.Name,
            request.BreedId,
            request.Sex,
            request.AgeYears,
            request.WeightKg,
            request.Color,
            photoUrl,
            request.Vaccines,
            request.Diseases,
            request.Medications,
            request.Allergies);

        db.Pets.Add(pet);
        await db.SaveChangesAsync(cancellationToken);

        return pet.Id;
    }
}
