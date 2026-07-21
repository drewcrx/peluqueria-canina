namespace PeluqueriaSaas.Api.Auth;

public static class AuthorizationPolicies
{
    public const string TenantUser = "TenantUser";
    public const string TenantOwner = "TenantOwner";
    public const string OwnerOrManager = "OwnerOrManager";
    public const string PlatformAdmin = "PlatformAdmin";
}
