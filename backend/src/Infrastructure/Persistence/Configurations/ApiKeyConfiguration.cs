using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Infrastructure.Persistence.Configurations;

public class ApiKeyConfiguration : IEntityTypeConfiguration<ApiKey>
{
    public void Configure(EntityTypeBuilder<ApiKey> builder)
    {
        builder.HasKey(k => k.Id);
        builder.Property(k => k.KeyHash).IsRequired().HasMaxLength(200);
        builder.Property(k => k.MaskedPreview).IsRequired().HasMaxLength(50);
        builder.HasIndex(k => k.KeyHash).IsUnique();
        builder.HasIndex(k => k.TenantId);
    }
}
