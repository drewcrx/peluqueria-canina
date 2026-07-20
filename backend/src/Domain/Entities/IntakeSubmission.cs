using PeluqueriaSaas.Domain.Common;

namespace PeluqueriaSaas.Domain.Entities;

/// <summary>
/// One public-form submission. This is the first, minimal shape of what Fase 3 will likely
/// generalize into a full "Historial" — kept as its own concept for now rather than guessing
/// the final Historial schema before Agenda is designed.
/// </summary>
public class IntakeSubmission : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; private set; }
    public Guid ClientId { get; private set; }
    public Guid PetId { get; private set; }
    public string? Observations { get; private set; }
    public string? SignatureUrl { get; private set; }

    private readonly List<string> _photoUrls = [];
    public IReadOnlyCollection<string> PhotoUrls => _photoUrls.AsReadOnly();

    private readonly List<IntakeSubmissionService> _requestedServices = [];
    public IReadOnlyCollection<IntakeSubmissionService> RequestedServices => _requestedServices.AsReadOnly();

    private IntakeSubmission() { }

    public static IntakeSubmission Create(
        Guid tenantId,
        Guid clientId,
        Guid petId,
        string? observations,
        IEnumerable<string> photoUrls,
        string? signatureUrl,
        IEnumerable<Guid> requestedServiceIds)
    {
        var submission = new IntakeSubmission
        {
            TenantId = tenantId,
            ClientId = clientId,
            PetId = petId,
            Observations = observations,
            SignatureUrl = signatureUrl
        };

        submission._photoUrls.AddRange(photoUrls);
        submission._requestedServices.AddRange(
            requestedServiceIds.Select(serviceId => IntakeSubmissionService.Create(submission.Id, serviceId)));

        return submission;
    }
}

public class IntakeSubmissionService
{
    public Guid IntakeSubmissionId { get; private set; }
    public Guid ServiceId { get; private set; }

    private IntakeSubmissionService() { }

    public static IntakeSubmissionService Create(Guid intakeSubmissionId, Guid serviceId) => new()
    {
        IntakeSubmissionId = intakeSubmissionId,
        ServiceId = serviceId
    };
}
