/**
 * Server Actions para gestão administrativa de usuários
 * 
 * FASE 7: CRUD Administrativo Seguro
 * FASE 9: Funcionalidades Administrativas Avançadas
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
 * Auditoria leve de ações administrativas
 * 
 * FASE 9: Logs estruturados no server-side (sem banco de dados)
 */
function logAdminAction(
  action: 'create' | 'update_role' | 'delete',
  adminUserId: string,
  targetUserId: string,
  details?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString();
  console.log('[ADMIN_ACTION]', {
    timestamp,
    action,
    adminUserId,
    targetUserId,
    ...details,
  });
}

/**
 * Resultado padronizado de uma operação administrativa
 * 
 * FASE 9: DTO padronizado para todas as Server Actions
 */
export type AdminActionResult = {
  success: boolean;
  error?: string;
  message?: string;
  data?: unknown; // Dados adicionais quando necessário
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
/**
 * Obtém lista de usuários da mesma empresa do administrador
 * 
 * FASE 9: Hardening - validações explícitas e tratamento de erros robusto
 */
export async function getAdminUsers(): Promise<AdminUserRow[]> {
  // HARDENING: Verificar permissão ANTES de qualquer operação (PRIMEIRA LINHA)
  await requirePermission(PERMISSIONS.USER_MANAGE);

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // HARDENING: Validar que admin profile existe
    const adminProfile = await getUserProfile();
    if (!adminProfile) {
      console.error('[getAdminUsers] Admin profile não encontrado');
      return [];
    }

    // HARDENING: Validar que company existe
    if (!adminProfile.company?.id) {
      console.error('[getAdminUsers] Company ID não encontrado');
      return [];
    }

    // Obter profiles da mesma company
    const { data: companyProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, role, created_at')
      .eq('company_id', adminProfile.company.id)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('[getAdminUsers] Erro ao buscar profiles:', profilesError);
      return [];
    }

    if (!companyProfiles || companyProfiles.length === 0) {
      return [];
    }

    // Obter emails dos usuários usando admin client
    const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();

    if (usersError) {
      console.error('[getAdminUsers] Erro ao buscar usuários do Auth:', usersError);
      // Retornar profiles sem emails em caso de erro
      return companyProfiles.map((profile) => ({
        id: profile.id,
        userId: profile.user_id,
        email: 'N/A',
        role: profile.role as 'admin' | 'user',
        created_at: profile.created_at,
      }));
    }

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
    console.error('[getAdminUsers] Erro inesperado:', error);
    return [];
  }
}

/**
 * Cria um novo usuário na mesma empresa do administrador
 * 
 * Requer permissão USER_MANAGE.
 * Cria usuário no Supabase Auth e profile vinculado à mesma company.
 */
/**
 * Cria um novo usuário na mesma empresa do administrador
 * 
 * FASE 9: Hardening - validações explícitas, auditoria leve, mensagens amigáveis
 */
export async function createUser(
  email: string,
  password: string,
  role: 'admin' | 'user' = 'user'
): Promise<AdminActionResult> {
  // HARDENING: Verificar permissão ANTES de qualquer operação (PRIMEIRA LINHA)
  await requirePermission(PERMISSIONS.USER_MANAGE);

  // HARDENING: Validações explícitas e claras
  const trimmedEmail = email?.trim().toLowerCase();
  if (!trimmedEmail) {
    return { success: false, error: 'E-mail é obrigatório' };
  }

  // Validação básica de formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { success: false, error: 'E-mail inválido' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'A senha deve ter no mínimo 6 caracteres' };
  }

  if (role !== ROLES.ADMIN && role !== ROLES.USER) {
    return { success: false, error: 'Role inválido. Deve ser "admin" ou "user"' };
  }

  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();

    // HARDENING: Validar que admin profile existe
    const adminProfile = await getUserProfile();
    if (!adminProfile) {
      return { success: false, error: 'Não foi possível identificar sua conta. Faça login novamente.' };
    }

    if (!adminProfile.company?.id) {
      return { success: false, error: 'Empresa não encontrada. Entre em contato com o suporte.' };
    }

    // Criar usuário no Supabase Auth usando admin client
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true, // Confirmar email automaticamente para admin criar usuários
    });

    if (authError || !authData.user) {
      // UX: Mensagem amigável sem vazar detalhes técnicos
      if (authError?.message?.includes('already registered')) {
        return { success: false, error: 'Este e-mail já está cadastrado no sistema' };
      }
      return { success: false, error: 'Não foi possível criar o usuário. Tente novamente.' };
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
      // HARDENING: Tentar limpar usuário criado se profile falhar (rollback)
      try {
        await adminClient.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('[createUser] Erro ao limpar usuário após falha no profile:', cleanupError);
      }
      return { success: false, error: 'Usuário criado, mas houve um erro ao configurar o perfil. Entre em contato com o suporte.' };
    }

    // AUDITORIA: Registrar ação administrativa
    logAdminAction('create', adminProfile.profile.user_id, authData.user.id, {
      email: trimmedEmail,
      role,
      companyId: adminProfile.company.id,
    });

    // Revalidar página de usuários
    revalidatePath('/admin/users');

    return {
      success: true,
      message: `Usuário ${trimmedEmail} criado com sucesso`,
      data: { userId: authData.user.id },
    };
  } catch (error) {
    console.error('[createUser] Erro inesperado:', error);
    return {
      success: false,
      error: 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.',
    };
  }
}

/**
 * Atualiza o role de um usuário
 * 
 * Requer permissão USER_MANAGE.
 * Apenas atualiza o role do profile, não altera dados do auth.
 */
/**
 * Atualiza o role de um usuário
 * 
 * FASE 9: Hardening - validações explícitas, auditoria leve, prevenção de auto-rebaixamento
 */
export async function updateUserRole(
  profileId: string,
  newRole: 'admin' | 'user'
): Promise<AdminActionResult> {
  // HARDENING: Verificar permissão ANTES de qualquer operação (PRIMEIRA LINHA)
  await requirePermission(PERMISSIONS.USER_MANAGE);

  // HARDENING: Validações explícitas
  if (!profileId || typeof profileId !== 'string' || profileId.trim() === '') {
    return { success: false, error: 'ID do usuário é obrigatório' };
  }

  if (newRole !== ROLES.ADMIN && newRole !== ROLES.USER) {
    return { success: false, error: 'Role inválido. Deve ser "admin" ou "user"' };
  }

  try {
    const supabase = await createClient();

    // HARDENING: Validar que admin profile existe
    const adminProfile = await getUserProfile();
    if (!adminProfile) {
      return { success: false, error: 'Não foi possível identificar sua conta. Faça login novamente.' };
    }

    // Verificar se o profile pertence à mesma company
    const { data: targetProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('company_id, user_id, role')
      .eq('id', profileId)
      .single();

    if (fetchError || !targetProfile) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // HARDENING: Validar isolamento multi-tenant
    if (targetProfile.company_id !== adminProfile.company.id) {
      return { success: false, error: 'Operação não permitida' };
    }

    // HARDENING: Prevenir auto-rebaixamento de admin único
    const { data: { user } } = await supabase.auth.getUser();
    if (user && targetProfile.user_id === user.id) {
      if (targetProfile.role === ROLES.ADMIN && newRole === ROLES.USER) {
        // Verificar se há outros admins na company
        const { data: otherAdmins } = await supabase
          .from('profiles')
          .select('id')
          .eq('company_id', adminProfile.company.id)
          .eq('role', ROLES.ADMIN)
          .neq('user_id', user.id)
          .limit(1);

        if (!otherAdmins || otherAdmins.length === 0) {
          return { success: false, error: 'Você não pode rebaixar a si mesmo sendo o único administrador' };
        }
      }
    }

    // Atualizar role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId);

    if (updateError) {
      console.error('[updateUserRole] Erro ao atualizar:', updateError);
      return { success: false, error: 'Não foi possível atualizar o role do usuário. Tente novamente.' };
    }

    // AUDITORIA: Registrar ação administrativa
    logAdminAction('update_role', adminProfile.profile.user_id, targetProfile.user_id, {
      profileId,
      oldRole: targetProfile.role,
      newRole,
      companyId: adminProfile.company.id,
    });

    // Revalidar página de usuários
    revalidatePath('/admin/users');

    return {
      success: true,
      message: `Role do usuário atualizado para ${newRole === ROLES.ADMIN ? 'administrador' : 'usuário'}`,
      data: { profileId, newRole },
    };
  } catch (error) {
    console.error('[updateUserRole] Erro inesperado:', error);
    return {
      success: false,
      error: 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.',
    };
  }
}

/**
 * Deleta um usuário (soft delete via Supabase Auth)
 * 
 * Requer permissão USER_MANAGE.
 * Remove o usuário do Supabase Auth (cascade remove profile automaticamente).
 */
/**
 * Deleta um usuário
 * 
 * FASE 9: Hardening - validações explícitas, auditoria leve, prevenção de auto-deleção
 */
export async function deleteUser(userId: string): Promise<AdminActionResult> {
  // HARDENING: Verificar permissão ANTES de qualquer operação (PRIMEIRA LINHA)
  await requirePermission(PERMISSIONS.USER_MANAGE);

  // HARDENING: Validações explícitas
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return { success: false, error: 'ID do usuário é obrigatório' };
  }

  try {
    const supabase = await createClient();

    // HARDENING: Validar que admin profile existe
    const adminProfile = await getUserProfile();
    if (!adminProfile) {
      return { success: false, error: 'Não foi possível identificar sua conta. Faça login novamente.' };
    }

    // Verificar se o profile pertence à mesma company
    const { data: targetProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('company_id, user_id, role')
      .eq('user_id', userId)
      .single();

    if (fetchError || !targetProfile) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // HARDENING: Validar isolamento multi-tenant
    if (targetProfile.company_id !== adminProfile.company.id) {
      return { success: false, error: 'Operação não permitida' };
    }

    // HARDENING: Prevenir auto-deleção
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === userId) {
      return { success: false, error: 'Você não pode deletar sua própria conta' };
    }

    // HARDENING: Prevenir deleção do último admin
    if (targetProfile.role === ROLES.ADMIN) {
      const { data: otherAdmins } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', adminProfile.company.id)
        .eq('role', ROLES.ADMIN)
        .neq('user_id', userId)
        .limit(1);

      if (!otherAdmins || otherAdmins.length === 0) {
        return { success: false, error: 'Não é possível deletar o último administrador da empresa' };
      }
    }

    // Deletar usuário usando admin client (cascade remove profile automaticamente)
    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('[deleteUser] Erro ao deletar:', deleteError);
      return { success: false, error: 'Não foi possível deletar o usuário. Tente novamente.' };
    }

    // AUDITORIA: Registrar ação administrativa
    logAdminAction('delete', adminProfile.profile.user_id, userId, {
      targetRole: targetProfile.role,
      companyId: adminProfile.company.id,
    });

    // Revalidar página de usuários
    revalidatePath('/admin/users');

    return {
      success: true,
      message: 'Usuário removido com sucesso',
      data: { userId },
    };
  } catch (error) {
    console.error('[deleteUser] Erro inesperado:', error);
    return {
      success: false,
      error: 'Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.',
    };
  }
}
