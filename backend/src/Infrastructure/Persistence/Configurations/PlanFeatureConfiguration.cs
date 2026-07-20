using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Infrastructure.Persistence.Configurations;

public class PlanFeatureConfiguration : IEntityTypeConfiguration<PlanFeature>
{
    public void Configure(EntityTypeBuilder<PlanFeature> builder)
    {
        builder.HasKey(f => f.Id);
        builder.Property(f => f.FeatureKey).IsRequired().HasMaxLength(50);
        builder.HasIndex(f => new { f.PlanId, f.FeatureKey }).IsUnique();
    }
}
