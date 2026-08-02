import { useSyncExternalStore } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

export interface Tema {
  id: string
  nome: string
  descricao: string
  /** Amostras de cor para o preview do card (primária, escura, acento). */
  swatch: [string, string, string]
}

export const TEMA_PADRAO = 'floresta'

export const TEMAS: Tema[] = [
  {
    id: 'floresta',
    nome: 'Floresta',
    descricao: 'Verde amazônico — o tema original.',
    swatch: ['#256b3d', '#0a2015', '#eea01f'],
  },
  {
    id: 'oceano',
    nome: 'Oceano',
    descricao: 'Turquesa e água — fresco e moderno.',
    swatch: ['#0d9488', '#042f2e', '#f59e0b'],
  },
  {
    id: 'terracota',
    nome: 'Terracota',
    descricao: 'Terra e âmbar — quente e acolhedor.',
    swatch: ['#9a4d22', '#2d1509', '#d97706'],
  },
  {
    id: 'ametista',
    nome: 'Ametista',
    descricao: 'Roxo vibrante — sofisticado.',
    swatch: ['#9333ea', '#3b0764', '#f59e0b'],
  },
  {
    id: 'grafite',
    nome: 'Grafite',
    descricao: 'Neutro elegante — sóbrio e minimalista.',
    swatch: ['#475569', '#020617', '#f59e0b'],
  },
]

const STORAGE_KEY = 'ong:tema'

/** Tema em cache local (para aplicar instantaneamente, sem piscar). */
export function temaEmCache(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? TEMA_PADRAO
  } catch {
    return TEMA_PADRAO
  }
}

// Store reativo: fonte única da verdade do tema aplicado (sobrevive a remontagens).
let atual = temaEmCache()
const listeners = new Set<() => void>()

/** Aplica o tema no documento (data-tema), guarda em cache e notifica a UI. */
export function aplicarTema(id: string) {
  const tema = TEMAS.some((t) => t.id === id) ? id : TEMA_PADRAO
  atual = tema
  const root = document.documentElement
  if (tema === TEMA_PADRAO) root.removeAttribute('data-tema')
  else root.setAttribute('data-tema', tema)
  try {
    localStorage.setItem(STORAGE_KEY, tema)
  } catch {
    /* ignora storage indisponível */
  }
  listeners.forEach((fn) => fn())
}

/** Hook reativo com o tema atualmente aplicado. */
export function useTemaAtual(): string {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => atual,
    () => TEMA_PADRAO,
  )
}

/** Busca o tema global salvo no Supabase (o que o admin aplicou para todos). */
export async function carregarTemaGlobal(): Promise<string> {
  if (!isSupabaseConfigured || !supabase) return temaEmCache()
  const { data, error } = await supabase
    .from('site_config')
    .select('tema')
    .eq('id', 'main')
    .single()
  if (error || !data?.tema) return temaEmCache()
  return data.tema as string
}

/** Salva o tema global (apenas admin — protegido por RLS). */
export async function salvarTemaGlobal(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase não configurado.' }
  const { error } = await supabase
    .from('site_config')
    .update({ tema: id, updated_at: new Date().toISOString() })
    .eq('id', 'main')
  return { error: error?.message ?? null }
}
