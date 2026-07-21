namespace PeluqueriaSaas.Application.Common.Interfaces;

/// <summary>
/// Outbound message to a client (e.g., an appointment reminder). Decoupled the same way as
/// payments/file storage: a local/no-cost implementation now (just logs), a WhatsApp Business
/// Cloud API implementation later when there's a paying client to justify the cost — nothing
/// else in the app needs to change when that happens.
/// </summary>
public interface INotificationSender
{
    Task SendAsync(Guid tenantId, string recipientPhone, string message, CancellationToken cancellationToken = default);
}
