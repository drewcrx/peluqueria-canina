import { useQuery } from '@tanstack/react-query'
import { PawPrint, Search, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TenantShell } from '../../components/layout/TenantShell'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageHeader } from '../../components/ui/PageHeader'
import { cardClass, inputClass } from '../../components/ui/styles'
import { resolveUploadUrl } from '../../lib/apiBaseUrl'
import { listPets } from './api'

const SEX_LABEL: Record<string, string> = { Male: 'Macho', Female: 'Hembra' }

export function PetsListPage() {
  const [search, setSearch] = useState('')
  const { data: pets, isLoading } = useQuery({ queryKey: ['pets'], queryFn: listPets })

  const filtered = useMemo(() => {
    if (!pets) return []
    const term = search.trim().toLowerCase()
    if (!term) return pets
    return pets.filter(
      (pet) => pet.name.toLowerCase().includes(term) || pet.clientFullName.toLowerCase().includes(term),
    )
  }, [pets, search])

  return (
    <TenantShell>
      <PageHeader title="Mascotas" subtitle="Busca cualquier mascota para ver su ficha o su tarjeta de identificación." />

      {isLoading && <p className="text-ink-soft">Cargando…</p>}

      {pets && pets.length === 0 && (
        <EmptyState
          icon={PawPrint}
          title="Todavía no hay mascotas registradas."
          description="Se crean al agregar una mascota desde la ficha de un cliente, o desde tu formulario público."
        />
      )}

      {pets && pets.length > 0 && (
        <>
          <div className="relative mb-5 max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por mascota o dueño…"
              className={`${inputClass} pl-10`}
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No encontramos mascotas con ese nombre." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((pet) => (
                <Link
                  key={pet.id}
                  to={`/mascotas/${pet.id}`}
                  className={`flex items-center gap-3 p-4 transition-colors hover:border-clay/50 ${cardClass}`}
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-sand-dark/60 bg-sand">
                    {pet.photoUrl ? (
                      <img src={resolveUploadUrl(pet.photoUrl)} alt={pet.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-soft/40">
                        <Shield className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{pet.name}</p>
                    <p className="truncate text-sm text-ink-soft">
                      {pet.breedName} · {SEX_LABEL[pet.sex]}
                      {pet.ageYears != null && ` · ${pet.ageYears} años`}
                    </p>
                    <p className="truncate text-xs text-ink-soft/70">{pet.clientFullName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </TenantShell>
  )
}
