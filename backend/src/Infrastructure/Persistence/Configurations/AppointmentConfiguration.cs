using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
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

        // ScheduledAt nunca se convierte a UTC real en esta app: es la hora local "de pared" que
        // el dueño/cliente eligió, tal cual. Npgsql exige Kind=Utc para escribir en una columna
        // "timestamp with time zone" — este converter solo etiqueta el valor al guardar y lo
        // vuelve a des-etiquetar al leer, para que ningún código (ni el navegador al recibir el
        // JSON) lo reinterprete como una hora distinta.
        builder.Property(a => a.ScheduledAt).HasConversion(new ValueConverter<DateTime?, DateTime?>(
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Unspecified) : v));

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
