using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Domain.Entities;

namespace PeluqueriaSaas.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Tenant> Tenants { get; }
    DbSet<Plan> Plans { get; }
    DbSet<PlanFeature> PlanFeatures { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Client> Clients { get; }
    DbSet<Breed> Breeds { get; }
    DbSet<Pet> Pets { get; }
    DbSet<Service> Services { get; }
    DbSet<IntakeSubmission> IntakeSubmissions { get; }
    DbSet<IntakeSubmissionService> IntakeSubmissionServices { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<Appointment> Appointments { get; }
    DbSet<AppointmentService> AppointmentServices { get; }
    DbSet<Product> Products { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<CashRegisterSession> CashRegisterSessions { get; }
    DbSet<CashTransaction> CashTransactions { get; }
    DbSet<AppointmentPhoto> AppointmentPhotos { get; }
    DbSet<ApiKey> ApiKeys { get; }
    DbSet<BusinessHours> BusinessHours { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
