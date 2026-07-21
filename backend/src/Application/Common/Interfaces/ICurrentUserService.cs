namespace PeluqueriaSaas.Application.Common.Interfaces;

/// <summary>Who is making this request — needed for accountability records like Caja (who opened/closed it).</summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
}
