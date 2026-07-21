using PeluqueriaSaas.Domain.Common;
using PeluqueriaSaas.Domain.Enums;

namespace PeluqueriaSaas.Domain.Entities;

public class CashTransaction : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid SessionId { get; private set; }
    public CashTransactionType Type { get; private set; }
    public decimal Amount { get; private set; }
    public string? Description { get; private set; }

    private CashTransaction() { }

    public static CashTransaction Create(Guid tenantId, Guid sessionId, CashTransactionType type, decimal amount, string? description) => new()
    {
        TenantId = tenantId,
        SessionId = sessionId,
        Type = type,
        Amount = amount,
        Description = description
    };
}
