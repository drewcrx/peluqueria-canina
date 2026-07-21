using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.Admin.Tenants.SeedDemoData;

/// <summary>
/// Platform Admin-only utility for sales demos — populates a tenant with realistic clients,
/// pets, appointments and (if the plan includes them) inventory/cash-register activity, so a
/// demo never starts from an empty dashboard. Safe to click more than once: the catalog-like
/// data (Services/Products/a first Caja session) is only created if the tenant doesn't have any
/// yet, but clients/pets/appointments are added fresh each time — that's the point of "repetible".
/// </summary>
public record SeedDemoDataCommand(Guid TenantId) : IRequest;

public class SeedDemoDataCommandHandler(
    IApplicationDbContext db, IEntitlementService entitlementService, IIdentityService identityService)
    : IRequestHandler<SeedDemoDataCommand>
{
    private static readonly string[] ClientNames =
    [
        "María José Andrade", "Carlos Zambrano", "Fernanda Ortiz", "Luis Chicaiza",
        "Andrea Salazar", "Diego Vaca", "Paola Guerrero", "Esteban Rosales",
    ];

    private static readonly string[] PetNames =
    [
        "Luna", "Toby", "Max", "Bella", "Rocky", "Nina", "Simón", "Coco",
    ];

    public async Task Handle(SeedDemoDataCommand request, CancellationToken cancellationToken)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken)
            ?? throw new NotFoundException("Peluquería no encontrada.");

        var breeds = await db.Breeds.ToListAsync(cancellationToken);
        if (breeds.Count == 0)
        {
            throw new ConflictException("No hay razas registradas todavía — no se puede generar datos de demo.");
        }

        var services = await db.Services.Where(s => s.TenantId == request.TenantId).ToListAsync(cancellationToken);
        if (services.Count == 0)
        {
            services = [Service.Create(request.TenantId, "Baño"), Service.Create(request.TenantId, "Corte de pelo"), Service.Create(request.TenantId, "Baño + Corte")];
            db.Services.AddRange(services);
        }

        var random = new Random();
        var seededPets = new List<(Client Client, Pet Pet)>();

        foreach (var name in ClientNames)
        {
            var client = Client.Create(request.TenantId, name, GeneratePhone(random), null, null);
            db.Clients.Add(client);

            var breed = breeds[random.Next(breeds.Count)];
            var pet = Pet.Create(
                request.TenantId, client.Id, PetNames[random.Next(PetNames.Length)], breed.Id,
                random.Next(2) == 0 ? PetSex.Male : PetSex.Female,
                random.Next(1, 10), (decimal)random.Next(2, 40), null, null, null, null);
            db.Pets.Add(pet);

            seededPets.Add((client, pet));
        }

        for (var i = 0; i < seededPets.Count; i++)
        {
            var (client, pet) = seededPets[i];
            var service = services[random.Next(services.Count)];

            var completed = Appointment.Create(
                request.TenantId, client.Id, pet.Id, DateTime.UtcNow.AddDays(-random.Next(3, 45)), null, [service.Id]);
            completed.MarkCompleted();
            db.Appointments.Add(completed);

            if (i % 2 == 0)
            {
                db.Appointments.Add(Appointment.Create(
                    request.TenantId, client.Id, pet.Id, DateTime.UtcNow.AddDays(random.Next(1, 10)), null, [service.Id]));
            }
            else if (i % 3 == 0)
            {
                db.Appointments.Add(Appointment.Create(request.TenantId, client.Id, pet.Id, null, null, [service.Id]));
            }
        }

        if (await entitlementService.HasFeatureAsync(request.TenantId, FeatureKeys.Inventory, cancellationToken))
        {
            var hasProducts = await db.Products.AnyAsync(p => p.TenantId == request.TenantId, cancellationToken);
            if (!hasProducts)
            {
                db.Products.AddRange(
                    Product.Create(request.TenantId, "Shampoo antipulgas", 15, 5, 8.5m),
                    Product.Create(request.TenantId, "Acondicionador", 10, 3, 7.0m),
                    Product.Create(request.TenantId, "Perfume para mascotas", 6, 2, 5.5m),
                    Product.Create(request.TenantId, "Corta uñas", 4, 2, 4.0m));
            }
        }

        if (await entitlementService.HasFeatureAsync(request.TenantId, FeatureKeys.Caja, cancellationToken))
        {
            var hasSessions = await db.CashRegisterSessions.AnyAsync(s => s.TenantId == request.TenantId, cancellationToken);
            if (!hasSessions)
            {
                var tenantUsers = await identityService.ListByTenantAsync(request.TenantId, cancellationToken);
                Guid? ownerId = null;
                foreach (var tenantUser in tenantUsers)
                {
                    var roles = await identityService.GetRolesAsync(tenantUser.Id, cancellationToken);
                    if (roles.Contains("TenantOwner"))
                    {
                        ownerId = tenantUser.Id;
                        break;
                    }
                }

                if (ownerId is not null)
                {
                    var session = CashRegisterSession.Open(request.TenantId, ownerId.Value, 50m);
                    db.CashRegisterSessions.Add(session);
                    db.CashTransactions.Add(CashTransaction.Create(request.TenantId, session.Id, CashTransactionType.Income, 45m, "Venta de shampoo"));
                    db.CashTransactions.Add(CashTransaction.Create(request.TenantId, session.Id, CashTransactionType.Expense, 12m, "Compra de insumos"));
                    session.Close(ownerId.Value, 83m);
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static string GeneratePhone(Random random) => $"09{random.Next(10_000_000, 99_999_999)}";
}
