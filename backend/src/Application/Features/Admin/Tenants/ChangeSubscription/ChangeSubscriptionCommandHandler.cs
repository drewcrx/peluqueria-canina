using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Admin.Tenants.ChangeSubscription;

public class ChangeSubscriptionCommandHandler(IApplicationDbContext db) : IRequestHandler<ChangeSubscriptionCommand>
{
    private static readonly TimeSpan BillingPeriod = TimeSpan.FromDays(30);

    public async Task Handle(ChangeSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await db.Subscriptions
            .Where(s => s.TenantId == request.TenantId)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException("Esta peluquería no tiene una suscripción.");

        if (request.NewPlanCode is not null)
        {
            var plan = await db.Plans.FirstOrDefaultAsync(p => p.Code == request.NewPlanCode && p.IsActive, cancellationToken)
                ?? throw new NotFoundException($"El plan '{request.NewPlanCode}' no existe o está inactivo.");
            subscription.ChangePlan(plan.Id);
        }

        switch (request.Action)
        {
            case SubscriptionAction.Activate:
                subscription.MarkActive(DateTime.UtcNow.Add(BillingPeriod));
                break;
            case SubscriptionAction.MarkPastDue:
                subscription.MarkPastDue();
                break;
            case SubscriptionAction.Cancel:
                subscription.Cancel();
                break;
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
