using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Infrastructure.Persistence.Configurations;

public class AppointmentPhotoConfiguration : IEntityTypeConfiguration<AppointmentPhoto>
{
    public void Configure(EntityTypeBuilder<AppointmentPhoto> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.PhotoUrl).HasMaxLength(500).IsRequired();
        builder.HasIndex(p => p.AppointmentId);
        builder.HasOne<Appointment>().WithMany().HasForeignKey(p => p.AppointmentId).OnDelete(DeleteBehavior.Cascade);
    }
}
