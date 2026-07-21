using PeluqueriaSaas.Domain.Common;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Domain.Entities;

public class CashRegisterSession : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid OpenedByUserId { get; private set; }
    public DateTime OpenedAt { get; private set; }
    public decimal OpeningAmount { get; private set; }
    public CashSessionStatus Status { get; private set; }
    public Guid? ClosedByUserId { get; private set; }
    public DateTime? ClosedAt { get; private set; }
    public decimal? ClosingAmount { get; private set; }

    private CashRegisterSession() { }

    public static CashRegisterSession Open(Guid tenantId, Guid openedByUserId, decimal openingAmount) => new()
    {
        TenantId = tenantId,
        OpenedByUserId = openedByUserId,
        OpenedAt = DateTime.UtcNow,
        OpeningAmount = openingAmount,
        Status = CashSessionStatus.Open
    };

    public void Close(Guid closedByUserId, decimal closingAmount)
    {
        Status = CashSessionStatus.Closed;
        ClosedByUserId = closedByUserId;
        ClosedAt = DateTime.UtcNow;
        ClosingAmount = closingAmount;
    }
}
