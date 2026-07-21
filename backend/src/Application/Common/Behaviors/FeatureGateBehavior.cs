using MediatR;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Common.Behaviors;

/// <summary>
/// For any request implementing IFeatureGatedRequest, checks the current tenant's plan before
/// the handler runs. A Básico tenant hitting an Intermedio-only endpoint gets a clear 409, not a
/// half-executed handler.
/// </summary>
public class FeatureGateBehavior<TRequest, TResponse>(IEntitlementService entitlementService, ITenantContext tenantContext)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (request is IFeatureGatedRequest gated)
        {
            var tenantId = tenantContext.RequireTenantId();
            var hasFeature = await entitlementService.HasFeatureAsync(tenantId, gated.RequiredFeatureKey, cancellationToken);

            if (!hasFeature)
            {
                throw new ConflictException(
                    "Esta función no está disponible en tu plan actual. Actualiza tu plan para desbloquearla.");
            }
        }

        return await next();
    }
}
