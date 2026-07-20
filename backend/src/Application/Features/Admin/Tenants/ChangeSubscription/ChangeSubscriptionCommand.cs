using MediatR;

namespace PeluqueriaSaas.Application.Features.Admin.Tenants.ChangeSubscription;

public enum SubscriptionAction
{
    /// <summary>Simula un pago recibido: activa la suscripción por un nuevo periodo.</summary>
    Activate,
    MarkPastDue,
    Cancel
}

public record ChangeSubscriptionCommand(Guid TenantId, SubscriptionAction Action, string? NewPlanCode) : IRequest;
