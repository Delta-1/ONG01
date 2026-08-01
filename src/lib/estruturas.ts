import { useSyncExternalStore } from 'react'
import { supabase, isSupabaseConfigured } from './supabase'

export interface Estrutura {
  id: string
  nome: string
  descricao: string
  /** Miniatura esquemática (blocos) para o preview no card. */
  preview: 'classica' | 'lateral' | 'central' | 'minimalista'
}

export const ESTRUTURA_PADRAO = 'classica'

export const ESTRUTURAS: Estrutura[] = [
  {
    id: 'classica',
    nome: 'Clássica',
    descricao: 'Barra superior com menu horizontal. O modelo atual.',
    preview: 'classica',
  },
  {
    id: 'lateral',
    nome: 'Lateral',
    descricao: 'Menu fixo na lateral esquerda, estilo painel.',
    preview: 'lateral',
  },
  {
    id: 'central',
    nome: 'Central',
    descricao: 'Logo e menu centralizados, com ar editorial.',
    preview: 'central',
  },
  {
    id: 'minimalista',
    nome: 'Minimalista',
    descricao: 'Barra fina e compacta, foco total no conteúdo.',
    preview: 'minimalista',
  },
]

const STORAGE_KEY = 'ong:estrutura'

function cache(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ESTRUTURA_PADRAO
  } catch {
    return ESTRUTURA_PADRAO
  }
}

// Store externo simples para o Layout reagir à troca de estrutura em tempo real.
let atual = cache()
const listeners = new Set<() => void>()

export function definirEstrutura(id: string) {
  const e = ESTRUTURAS.some((x) => x.id === id) ? id : ESTRUTURA_PADRAO
  atual = e
  try {
    localStorage.setItem(STORAGE_KEY, e)
  } catch {
    /* ignora */
  }
  document.documentElement.setAttribute('data-estrutura', e)
  listeners.forEach((fn) => fn())
}

export function useEstrutura(): string {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => atual,
    () => ESTRUTURA_PADRAO,
  )
}

export async function carregarEstruturaGlobal(): Promise<string> {
  if (!isSupabaseConfigured || !supabase) return cache()
  const { data, error } = await supabase
    .from('site_config')
    .select('estrutura')
    .eq('id', 'main')
    .single()
  if (error || !data?.estrutura) return cache()
  return data.estrutura as string
}

export async function salvarEstruturaGlobal(id: string): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase não configurado.' }
  const { error } = await supabase
    .from('site_config')
    .update({ estrutura: id, updated_at: new Date().toISOString() })
    .eq('id', 'main')
  return { error: error?.message ?? null }
}
