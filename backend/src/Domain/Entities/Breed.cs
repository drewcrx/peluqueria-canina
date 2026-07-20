using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

/// <summary>
/// Deliberately NOT tenant-scoped — shared reference data across every tenant, the one
/// intentional exception to strict row isolation (see Fase 1 design notes).
/// </summary>
public class Breed : BaseEntity
{
    public string Name { get; private set; } = default!;

    private Breed() { }

    public static Breed Create(string name) => new() { Name = name };
}
