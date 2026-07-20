using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Infrastructure.Persistence.Configurations;

public class IntakeSubmissionConfiguration : IEntityTypeConfiguration<IntakeSubmission>
{
    public void Configure(EntityTypeBuilder<IntakeSubmission> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Observations).HasMaxLength(1000);
        builder.Property(s => s.SignatureUrl).HasMaxLength(500);
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => s.ClientId);
        builder.HasIndex(s => s.PetId);

        builder.PrimitiveCollection<List<string>>("_photoUrls").HasColumnName("PhotoUrls");

        builder.HasMany(s => s.RequestedServices)
            .WithOne()
            .HasForeignKey(rs => rs.IntakeSubmissionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(s => s.RequestedServices).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public class IntakeSubmissionServiceConfiguration : IEntityTypeConfiguration<IntakeSubmissionService>
{
    public void Configure(EntityTypeBuilder<IntakeSubmissionService> builder)
    {
        builder.HasKey(x => new { x.IntakeSubmissionId, x.ServiceId });
        builder.HasOne<Service>().WithMany().HasForeignKey(x => x.ServiceId).OnDelete(DeleteBehavior.Restrict);
    }
}
