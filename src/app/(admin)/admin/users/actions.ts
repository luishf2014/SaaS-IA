/**
 * Server Actions para gestão administrativa de usuários
 * 
 * FASE 7: CRUD Administrativo Seguro
 * 
 * Todas as ações são protegidas por RBAC usando requirePermission().
 * Nenhuma mutação ocorre antes da verificação de permissão.
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY e nunca deve ser importado em Client Components.
 */

'use server';

import 'server-only';

import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getUserProfile } from '@/lib/profile';
import { revalidatePath } from 'next/cache';
import { ROLES } from '@/lib/rbac/types';

/**
 * Resultado de uma operação administrativa
 */
export type AdminActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

/**
 * DTO para exibição de usuário na lista administrativa
 * 
 * FASE 7: Tipo explícito para consumo da UI (sem any)
 */
export type AdminUserRow = {
  id: string; // profile.id
  userId: string; // profile.user_id
  email: string;
  role: 'admin' | 'user';
  created_at: string;
};

/**
 * Obtém lista de usuários da mesma empresa do administrador
 * 
 * FASE 7: Server Action para leitura administrativa
 * 
 * Requer permissão USER_MANAGE.
 * Retorna apenas dados necessários para exibição (DTO).
 * 
 * IMPORTANTE: Esta função é a única forma de obter dados administrativos.
 * page.tsx nunca deve acessar admin client ou auth.users diretamente.
 */
export async function getAdminUsers(): Promise<AdminUserRow[]> {
  // Verificar permissão ANTES de qualquer operação
  await requirePermission(PERMISSIONS.USER_MANAGE);

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Obter company do administrador atual
    const adminProfile = await getUserProfile();
    if (!adminProfile) {
      return [];
    }

    // Obter profiles da mesma company
    const { data: companyProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, role, created_at')
      .eq('company_id', adminProfile.company.id)
      .order('created_at', { ascending: false });

    if (profilesError || !companyProfiles || companyProfiles.length === 0) {
      return [];
    }

    // Obter emails dos usuários usando admin client
    const { data: usersData } = await adminClient.auth.admin.listUsers();
    const usersMap = new Map(
      usersData?.users.map((u) => [u.id, u.email || 'N/A']) || []
    );

    // Montar DTO com apenas dados necessários
    const adminUsers: AdminUserRow[] = companyProfiles.map((profile) => ({
      id: profile.id,
      userId: profile.user_id,
      email: usersMap.get(profile.user_id) || 'N/A',
      role: profile.role as 'admin' | 'user',
      created_at: profile.created_at,
    }));

    return adminUsers;
  } catch (error) {
    console.error('Erro ao obter lista de usuários:', error);
    return [];
  }
}

/**
 * Cria um novo usuário na mesma empresa do administrador
 * 
 * Requer permissão USER_MANAGE.
 * Cria usuário no Supabase Auth e profile vinculado à mesma company.
 */
export async function createUser(
  email: string,
  password: string,
  role: 'admin' | 'user' = 'user'
): Promise<AdminActionResult> {
  // Verificar permissão ANTES de qualquer operação
  await requirePermission(PERMISSIONS.USER_MANAGE);

  // Validação básica
  if (!email || !password) {
    return { success: false, error: 'Email e senha são obrigatórios' };
  }

  if (password.length < 6) {
    return { success: false, error: 'A senha deve ter no mínimo 6 caracteres' };
  }

  if (role !== ROLES.ADMIN && role !== ROLES.USER) {
    return { success: false, error: 'Role inválido' };
  }

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // Obter company do administrador atual
    const adminProfile = await getUserProfile();
    if (!adminProfile) {
      return { success: false, error: 'Perfil do administrador não encontrado' };
    }

    // Criar usuário no Supabase Auth usando admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true, // Confirmar email automaticamente para admin criar usuários
    });

    if (authError || !authData.user) {
      // Não vazar detalhes específicos do erro de autenticação
      return { success: false, error: 'Erro ao criar usuário. Verifique se o email já está em uso.' };
    }

    // Criar profile vinculado à mesma company do administrador
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        company_id: adminProfile.company.id,
        role,
      });

    if (profileError) {
      // Tentar limpar usuário criado se profile falhar
      try {
        await adminClient.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Erro ao limpar usuário após falha no profile:', cleanupError);
      }
      return { success: false, error: 'Erro ao criar perfil do usuário' };
    }

    // Revalidar página de usuários
    revalidatePath('/admin/users');

    return {
      success: true,
      message: `Usuário ${email} criado com sucesso com role ${role}`,
    };
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao criar usuário',
    };
  }
}

/**
 * Atualiza o role de um usuário
 * 
 * Requer permissão USER_MANAGE.
 * Apenas atualiza o role do profile, não altera dados do auth.
 */
export async function updateUserRole(
  profileId: string,
  newRole: 'admin' | 'user'
): Promise<AdminActionResult> {
  // Verificar permissão ANTES de qualquer operação
  await requirePermission(PERMISSIONS.USER_MANAGE);

  // Validação básica
  if (!profileId) {
    return { success: false, error: 'ID do perfil é obrigatório' };
  }

  if (newRole !== ROLES.ADMIN && newRole !== ROLES.USER) {
    return { success: false, error: 'Role inválido' };
  }

  try {
    const supabase = await createClient();

    // Obter company do administrador atual
    const adminProfile = await getUserProfile();
    if (!adminProfile) {
      return { success: false, error: 'Perfil do administrador não encontrado' };
    }

    // Verificar se o profile pertence à mesma company
    const { data: targetProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', profileId)
      .single();

    if (fetchError || !targetProfile) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    if (targetProfile.company_id !== adminProfile.company.id) {
      return { success: false, error: 'Operação não permitida' };
    }

    // Atualizar role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId);

    if (updateError) {
      return { success: false, error: 'Erro ao atualizar role do usuário' };
    }

    // Revalidar página de usuários
    revalidatePath('/admin/users');

    return {
      success: true,
      message: `Role do usuário atualizado para ${newRole}`,
    };
  } catch (error) {
    console.error('Erro ao atualizar role:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar role',
    };
  }
}

/**
 * Deleta um usuário (soft delete via Supabase Auth)
 * 
 * Requer permissão USER_MANAGE.
 * Remove o usuário do Supabase Auth (cascade remove profile automaticamente).
 */
export async function deleteUser(userId: string): Promise<AdminActionResult> {
  // Verificar permissão ANTES de qualquer operação
  await requirePermission(PERMISSIONS.USER_MANAGE);

  // Validação básica
  if (!userId) {
    return { success: false, error: 'ID do usuário é obrigatório' };
  }

  try {
    const supabase = await createClient();

    // Obter company do administrador atual
    const adminProfile = await getUserProfile();
    if (!adminProfile) {
      return { success: false, error: 'Perfil do administrador não encontrado' };
    }

    // Verificar se o profile pertence à mesma company
    const { data: targetProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('company_id, user_id')
      .eq('user_id', userId)
      .single();

    if (fetchError || !targetProfile) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    if (targetProfile.company_id !== adminProfile.company.id) {
      return { success: false, error: 'Operação não permitida' };
    }

    // Não permitir deletar a si mesmo
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === userId) {
      return { success: false, error: 'Você não pode deletar sua própria conta' };
    }

    // Deletar usuário usando admin client (cascade remove profile automaticamente)
    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return { success: false, error: 'Erro ao deletar usuário' };
    }

    // Revalidar página de usuários
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'Usuário deletado com sucesso',
    };
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao deletar usuário',
    };
  }
}
