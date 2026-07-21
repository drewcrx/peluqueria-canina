using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common;
using PeluqueriaSaas.Application.Common.Exceptions;
using PeluqueriaSaas.Application.Common.Interfaces;
using PeluqueriaSaas.Domain.Entities;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Application.Features.CashRegister.OpenCashSession;

public record OpenCashSessionCommand(decimal OpeningAmount) : IRequest<Guid>, IFeatureGatedRequest
{
    public string RequiredFeatureKey => FeatureKeys.Caja;
}

public class OpenCashSessionCommandValidator : AbstractValidator<OpenCashSessionCommand>
{
    public OpenCashSessionCommandValidator()
    {
        RuleFor(x => x.OpeningAmount).GreaterThanOrEqualTo(0);
    }
}

public class OpenCashSessionCommandHandler(IApplicationDbContext db, ITenantContext tenantContext, ICurrentUserService currentUser)
    : IRequestHandler<OpenCashSessionCommand, Guid>
{
    public async Task<Guid> Handle(OpenCashSessionCommand request, CancellationToken cancellationToken)
    {
        var alreadyOpen = await db.CashRegisterSessions.AnyAsync(s => s.Status == CashSessionStatus.Open, cancellationToken);
        if (alreadyOpen)
        {
            throw new ConflictException("Ya hay una caja abierta.");
        }

        var session = CashRegisterSession.Open(tenantContext.RequireTenantId(), currentUser.RequireUserId(), request.OpeningAmount);
        db.CashRegisterSessions.Add(session);
        await db.SaveChangesAsync(cancellationToken);

        return session.Id;
    }
}
