using PeluqueriaSaas.Domain.Common;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Domain.Entities;

/// <summary>
/// The salon's subscription to the platform. Not to be confused with the salon's own
/// invoicing of its clients (Caja/Facturación, a separate module) — mixing those two
/// money flows into one table is a modeling mistake we're deliberately avoiding.
/// </summary>
public class Subscription : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid PlanId { get; private set; }
    public SubscriptionStatus Status { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime CurrentPeriodEnd { get; private set; }
    public DateTime? CancelledAt { get; private set; }
    /// <summary>Reference id in the future real payment gateway (Stripe/Payphone). Null while simulated.</summary>
    public string? PaymentGatewayRef { get; private set; }

    private Subscription() { }

    public static Subscription StartTrial(Guid tenantId, Guid planId, TimeSpan trialLength) => new()
    {
        TenantId = tenantId,
        PlanId = planId,
        Status = SubscriptionStatus.Trialing,
        StartedAt = DateTime.UtcNow,
        CurrentPeriodEnd = DateTime.UtcNow.Add(trialLength)
    };

    public void ChangePlan(Guid planId) => PlanId = planId;

    public void MarkActive(DateTime currentPeriodEnd)
    {
        Status = SubscriptionStatus.Active;
        CurrentPeriodEnd = currentPeriodEnd;
    }

    public void MarkPastDue() => Status = SubscriptionStatus.PastDue;

    public void Cancel()
    {
        Status = SubscriptionStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
    }

    public bool GrantsAccess => Status is SubscriptionStatus.Trialing or SubscriptionStatus.Active or SubscriptionStatus.PastDue;
}
