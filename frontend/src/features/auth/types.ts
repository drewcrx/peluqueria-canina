export interface AuthUser {
  userId: string
  email: string
  fullName: string
  tenantId: string | null
  roles: string[]
}

export const ROLE_PLATFORM_ADMIN = 'PlatformAdmin'
export const ROLE_TENANT_OWNER = 'TenantOwner'
export const ROLE_MANAGER = 'Manager'
