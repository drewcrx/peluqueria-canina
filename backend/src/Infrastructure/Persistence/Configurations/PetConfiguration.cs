using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Infrastructure.Persistence.Configurations;

public class PetConfiguration : IEntityTypeConfiguration<Pet>
{
    public void Configure(EntityTypeBuilder<Pet> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Sex).HasConversion<string>().HasMaxLength(10);
        builder.Property(p => p.WeightKg).HasColumnType("decimal(5,2)");
        builder.Property(p => p.Vaccines).HasMaxLength(500);
        builder.Property(p => p.Diseases).HasMaxLength(500);
        builder.Property(p => p.Medications).HasMaxLength(500);
        builder.Property(p => p.Allergies).HasMaxLength(500);
        builder.HasIndex(p => p.ClientId);
        builder.HasIndex(p => p.TenantId);

        builder.HasOne<Breed>().WithMany().HasForeignKey(p => p.BreedId).OnDelete(DeleteBehavior.Restrict);
    }
}
