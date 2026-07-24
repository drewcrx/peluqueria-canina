namespace PeluqueriaSaas.Application.Common.Interfaces;

/// <summary>
/// Outbound email. Decoupled the same way as payments/WhatsApp/file storage: a local/no-cost
/// implementation now (just logs), a real provider (e.g. Resend, SendGrid) later when there's a
/// paying client to justify the cost — nothing else in the app needs to change when that happens.
/// </summary>
public interface IEmailSender
{
    Task SendAsync(string recipientEmail, string subject, string body, CancellationToken cancellationToken = default);
}
