using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Features.Appointments.UploadAppointmentPhoto;

public record UploadAppointmentPhotoCommand(Guid AppointmentId, StoredFile Photo)
    : IRequest<string>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Photos;
}

public class UploadAppointmentPhotoCommandHandler(IApplicationDbContext db, IFileStorage fileStorage, ITenantContext tenantContext)
    : IRequestHandler<UploadAppointmentPhotoCommand, string>
{
    public async Task<string> Handle(UploadAppointmentPhotoCommand request, CancellationToken cancellationToken)
    {
        var appointmentExists = await db.Appointments.AnyAsync(a => a.Id == request.AppointmentId, cancellationToken);
        if (!appointmentExists)
        {
            throw new NotFoundException("Cita no encontrada.");
        }

        var tenantId = tenantContext.RequireTenantId();
        var photoUrl = await fileStorage.SaveAsync(tenantId, request.Photo, cancellationToken);

        var photo = AppointmentPhoto.Create(tenantId, request.AppointmentId, photoUrl);
        db.AppointmentPhotos.Add(photo);
        await db.SaveChangesAsync(cancellationToken);

        return photoUrl;
    }
}
