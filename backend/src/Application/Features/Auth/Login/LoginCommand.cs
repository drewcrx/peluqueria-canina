using MediatR;
using PeluqueriaSaas.Application.Features.Auth.Common;

namespace PeluqueriaSaas.Application.Features.Auth.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResultDto>;
