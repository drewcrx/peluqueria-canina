using MediatR;
using PeluqueriaSaas.Application.Features.Auth.Common;

namespace PeluqueriaSaas.Application.Features.Auth.Refresh;

public record RefreshTokenCommand(string RawRefreshToken) : IRequest<AuthResultDto>;
