/**
 * Funções para gerenciamento de perfil e company
 * 
 * Garante que todo usuário autenticado tenha:
 * - Uma company (criada automaticamente)
 * - Um profile (criado automaticamente)
 * 
 * Esta função é idempotente: pode ser chamada múltiplas vezes sem criar duplicatas
 */

import { createClient } from '@/lib/supabase/server';

export interface Company {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  company_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface UserProfile {
  profile: Profile;
  company: Company;
}

/**
 * Garante que o usuário autenticado tenha company e profile
 * 
 * Se não existirem, cria automaticamente.
 * Se já existirem, retorna os existentes.
 * 
 * @returns Perfil e company do usuário, ou null se não autenticado
 */
export async function ensureUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Verificar se já existe profile
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('user_id', user.id)
    .single();

  // Se encontrou perfil, retornar
  if (existingProfile && !profileError) {
    return {
      profile: {
        id: existingProfile.id,
        user_id: existingProfile.user_id,
        company_id: existingProfile.company_id,
        role: existingProfile.role,
        created_at: existingProfile.created_at,
      },
      company: existingProfile.companies as Company,
    };
  }

  // Profile não existe - criar company e profile
  // Nome padrão da company baseado no email do usuário
  const companyName = `Empresa de ${user.email || 'Usuário'}`;

  // Criar company
  const { data: companyData, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: companyName,
      owner_id: user.id,
    })
    .select()
    .single();

  if (companyError || !companyData) {
    console.error('Erro ao criar company:', companyError);
    throw new Error('Erro ao criar empresa. Tente novamente.');
  }

  // Criar profile vinculado à company
  const { data: profileData, error: newProfileError } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      company_id: companyData.id,
      role: 'user', // Role padrão
    })
    .select()
    .single();

  if (newProfileError || !profileData) {
    console.error('Erro ao criar profile:', newProfileError);
    
    // Tentar limpar company se profile falhar
    try {
      await supabase.from('companies').delete().eq('id', companyData.id);
    } catch (cleanupError) {
      console.error('Erro ao limpar company:', cleanupError);
    }
    
    throw new Error('Erro ao criar perfil. Tente novamente.');
  }

  // Retornar dados criados
  return {
    profile: {
      id: profileData.id,
      user_id: profileData.user_id,
      company_id: profileData.company_id,
      role: profileData.role,
      created_at: profileData.created_at,
    },
    company: companyData,
  };
}

/**
 * Obtém o profile e company do usuário autenticado
 * 
 * @returns Perfil e company do usuário, ou null se não autenticado ou não existir
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, companies(*)')
    .eq('user_id', user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  return {
    profile: {
      id: profile.id,
      user_id: profile.user_id,
      company_id: profile.company_id,
      role: profile.role,
      created_at: profile.created_at,
    },
    company: profile.companies as Company,
  };
}
