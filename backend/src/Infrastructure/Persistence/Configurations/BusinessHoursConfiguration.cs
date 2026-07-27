using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Infrastructure.Persistence.Configurations;

public class BusinessHoursConfiguration : IEntityTypeConfiguration<BusinessHours>
{
    public void Configure(EntityTypeBuilder<BusinessHours> builder)
    {
        builder.HasKey(b => b.Id);
        builder.Property(b => b.DayOfWeek).HasConversion<int>();
        builder.HasIndex(b => new { b.TenantId, b.DayOfWeek }).IsUnique();
    }
}
