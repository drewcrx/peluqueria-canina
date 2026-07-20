using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Common;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Infrastructure.Identity;

namespace PeluqueriaSaas.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantContext tenantContext)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options), IApplicationDbContext
{
    private static readonly MethodInfo SetTenantFilterMethod = typeof(ApplicationDbContext)
        .GetMethod(nameof(SetTenantFilter), BindingFlags.NonPublic | BindingFlags.Instance)!;

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<PlanFeature> PlanFeatures => Set<PlanFeature>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Breed> Breeds => Set<Breed>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<IntakeSubmission> IntakeSubmissions => Set<IntakeSubmission>();
    public DbSet<IntakeSubmissionService> IntakeSubmissionServices => Set<IntakeSubmissionService>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<AppointmentService> AppointmentServices => Set<AppointmentService>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // IMPORTANTE: estos filtros deben construirse desde un método DE INSTANCIA de este
        // DbContext (no un helper estático externo). EF Core solo re-parametriza por request
        // los filtros cuyo closure queda "anclado" a la instancia (this) del DbContext — si el
        // closure se crea dentro de un método estático ajeno, EF Core lo trata como una
        // constante fija en el momento en que se construyó el modelo (que ocurre UNA sola vez
        // en la vida de la aplicación) y lo hornea como literal SQL (p. ej. "WHERE FALSE"),
        // ignorando el tenant real de cada request. Ya nos pasó una vez: lección cara.
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            if (typeof(ITenantScoped).IsAssignableFrom(entityType.ClrType))
            {
                SetTenantFilterMethod.MakeGenericMethod(entityType.ClrType).Invoke(this, [builder]);
            }
        }

        // AspNetUsers no puede implementar ITenantScoped (su TenantId es nullable — null
        // identifica al staff de la plataforma), así que su filtro se declara aquí directamente
        // con la misma regla: Platform Admin ve todo, un tenant solo ve sus propios usuarios.
        builder.Entity<ApplicationUser>().HasQueryFilter(u =>
            tenantContext.IsPlatformAdmin || u.TenantId == tenantContext.TenantId);
    }

    private void SetTenantFilter<TEntity>(ModelBuilder builder) where TEntity : class, ITenantScoped
    {
        builder.Entity<TEntity>().HasQueryFilter(e =>
            tenantContext.IsPlatformAdmin || e.TenantId == tenantContext.TenantId);
    }
}
