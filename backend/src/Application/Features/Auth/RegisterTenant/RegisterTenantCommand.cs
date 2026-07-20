using PeluqueriaSaas.Application.Features.Auth.Common;
using MediatR;

namespace PeluqueriaSaas.Application.Features.Auth.RegisterTenant;

public record RegisterTenantCommand(
    string CompanyName,
    string OwnerFullName,
    string OwnerEmail,
    string OwnerPassword) : IRequest<AuthResultDto>;
