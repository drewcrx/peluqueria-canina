namespace PeluqueriaSaas.Domain.Entities;

/// <summary>
/// Feature keys are plain strings in the database (not an enum) so a future Platform Admin
/// screen can toggle features per plan, or a new plan can mix-and-match features, without a
/// code deployment. These constants exist only so application code never hardcodes a typo-prone
/// string literal when checking entitlements.
/// </summary>
public static class FeatureKeys
{
    public const string Inventory = "Inventory";
    public const string Caja = "Caja";
    public const string Reminders = "Reminders";
    public const string Photos = "Photos";
    public const string Stats = "Stats";
    public const string AdvancedRoles = "AdvancedRoles";
    public const string Api = "Api";
    public const string AdvancedDashboard = "AdvancedDashboard";
    public const string Integrations = "Integrations";
    public const string CustomDomain = "CustomDomain";
    public const string WhatsApp = "WhatsApp";
    public const string Invoicing = "Invoicing";
    public const string AutoBackups = "AutoBackups";
}
