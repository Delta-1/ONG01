import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do Observatório Acriano.
 *
 * As credenciais vêm das variáveis de ambiente (arquivo .env, veja .env.example).
 * A `anon key` é uma chave PÚBLICA, feita para rodar no navegador — a proteção
 * real dos dados é responsabilidade das políticas de RLS (Row Level Security)
 * configuradas no projeto Supabase. NUNCA coloque a `service_role` key aqui.
 *
 * Consultas públicas usam somente registros reais e validados.
 * Erros e bases vazias não ativam dados de demonstração.
 */
const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null;
