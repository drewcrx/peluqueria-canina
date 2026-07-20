using MediatR;

namespace PeluqueriaSaas.Application.Features.Notifications.ListNotifications;

public record ListNotificationsQuery : IRequest<NotificationsResultDto>;

public record NotificationDto(Guid Id, string Message, bool IsRead, DateTime CreatedAt);
public record NotificationsResultDto(int UnreadCount, IReadOnlyList<NotificationDto> Items);
