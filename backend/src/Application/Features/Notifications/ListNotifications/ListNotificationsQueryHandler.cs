using MediatR;
using Microsoft.EntityFrameworkCore;
using PeluqueriaSaas.Application.Common.Interfaces;

namespace PeluqueriaSaas.Application.Features.Notifications.ListNotifications;

public class ListNotificationsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ListNotificationsQuery, NotificationsResultDto>
{
    private const int MaxItems = 20;

    public async Task<NotificationsResultDto> Handle(ListNotificationsQuery request, CancellationToken cancellationToken)
    {
        var unreadCount = await db.Notifications.CountAsync(n => !n.IsRead, cancellationToken);

        var items = await db.Notifications
            .OrderByDescending(n => n.CreatedAt)
            .Take(MaxItems)
            .Select(n => new NotificationDto(n.Id, n.Message, n.IsRead, n.CreatedAt))
            .ToListAsync(cancellationToken);

        return new NotificationsResultDto(unreadCount, items);
    }
}
