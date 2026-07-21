using Microsoft.Extensions.Logging;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Infrastructure.Services;

/// <summary>Dev/no-cost implementation of INotificationSender — just logs. See interface docs.</summary>
public class LogNotificationSender(ILogger<LogNotificationSender> logger) : INotificationSender
{
    public Task SendAsync(Guid tenantId, string recipientPhone, string message, CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "[Recordatorio simulado] Tenant {TenantId} → {Phone}: {Message}", tenantId, recipientPhone, message);
        return Task.CompletedTask;
    }
}
