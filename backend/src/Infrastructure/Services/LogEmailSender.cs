using Microsoft.Extensions.Logging;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Infrastructure.Services;

/// <summary>Dev/no-cost implementation of IEmailSender — just logs. See interface docs.</summary>
public class LogEmailSender(ILogger<LogEmailSender> logger) : IEmailSender
{
    public Task SendAsync(string recipientEmail, string subject, string body, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("[Email simulado] Para {Email} — {Subject}: {Body}", recipientEmail, subject, body);
        return Task.CompletedTask;
    }
}
