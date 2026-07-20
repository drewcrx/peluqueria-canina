using MediatR;

namespace PeluqueriaSaas.Application.Features.Auth.Logout;

public record LogoutCommand(string RawRefreshToken) : IRequest;
