using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Infrastructure.Persistence.Configurations;

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.Notes).HasMaxLength(1000);
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => a.ClientId);
        builder.HasIndex(a => a.PetId);
        builder.HasIndex(a => a.ScheduledAt);

        builder.HasMany(a => a.RequestedServices)
            .WithOne()
            .HasForeignKey(rs => rs.AppointmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(a => a.RequestedServices).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public class AppointmentServiceConfiguration : IEntityTypeConfiguration<AppointmentService>
{
    public void Configure(EntityTypeBuilder<AppointmentService> builder)
    {
        builder.HasKey(x => new { x.AppointmentId, x.ServiceId });
        builder.HasOne<Service>().WithMany().HasForeignKey(x => x.ServiceId).OnDelete(DeleteBehavior.Restrict);
    }
}
