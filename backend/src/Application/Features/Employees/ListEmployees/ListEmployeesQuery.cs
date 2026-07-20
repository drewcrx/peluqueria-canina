using MediatR;

namespace PeluqueriaSaas.Application.Features.Employees.ListEmployees;

public record ListEmployeesQuery : IRequest<IReadOnlyList<EmployeeDto>>;

public record EmployeeDto(Guid Id, string FullName, string Email, bool IsActive, IReadOnlyList<string> Roles);
