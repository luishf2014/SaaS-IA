/**
 * Componente de ações para usuário (editar role, deletar)
 * 
 * FASE 7: CRUD Administrativo Seguro
 * FASE 9: Funcionalidades Administrativas Avançadas
 * 
 * Client Component que chama Server Actions protegidas por RBAC.
 * UI apenas coleta dados e exibe feedback, nunca decide permissões.
 */

'use client';

import { useState, useEffect } from 'react';
import { updateUserRole, deleteUser, type AdminActionResult } from './actions';

interface UserActionsProps {
  profileId: string;
  userId: string;
  currentRole: 'admin' | 'user';
  userEmail?: string;
}

export default function UserActions({
  profileId,
  userId,
  currentRole,
  userEmail,
}: UserActionsProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionType, setActionType] = useState<'role' | 'delete' | null>(null);

  // FASE 9: Auto-dismiss de mensagens de sucesso
  useEffect(() => {
    if (result?.success) {
      const timer = setTimeout(() => {
        setResult(null);
        setActionType(null);
      }, 4000); // 4 segundos
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleUpdateRole = async (newRole: 'admin' | 'user') => {
    if (newRole === currentRole) return;

    setLoading(true);
    setResult(null);
    setActionType('role');

    try {
      const response = await updateUserRole(profileId, newRole);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao atualizar role',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setResult(null);
    setActionType('delete');

    try {
      const response = await deleteUser(userId);
      setResult(response);
      if (response.success) {
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao deletar usuário',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
      {/* Dropdown de Role - FASE 9: Melhorado */}
      <select
        value={currentRole}
        onChange={(e) => handleUpdateRole(e.target.value as 'admin' | 'user')}
        disabled={loading || actionType === 'role'}
        className="px-3 py-1 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 focus:ring-2 focus:ring-blue-500 transition-colors"
        title="Alterar role do usuário"
      >
        <option value="user">Usuário</option>
        <option value="admin">Administrador</option>
      </select>

      {/* Botão Deletar - FASE 9: Confirmação melhorada */}
      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="px-3 py-1 text-sm bg-red-950/50 border border-red-800 text-red-400 hover:bg-red-900/50 rounded-lg disabled:opacity-50 transition-colors"
          title="Deletar usuário"
        >
          Deletar
        </button>
      ) : (
        <div className="flex items-center gap-2 bg-slate-800/50 px-2 py-1 rounded-lg border border-red-800/50">
          <span className="text-xs text-slate-300">Confirmar exclusão?</span>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : 'Sim'}
          </button>
          <button
            onClick={() => {
              setShowDeleteConfirm(false);
              setResult(null);
            }}
            disabled={loading}
            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50 transition-colors"
          >
            Não
          </button>
        </div>
      )}

      {/* Feedback - FASE 9: Melhorado */}
      {result && (
        <div
          className={`absolute right-0 top-full mt-2 z-10 min-w-[200px] p-2 rounded-lg border shadow-lg ${
            result.success
              ? 'bg-green-950/95 border-green-800 text-green-300'
              : 'bg-red-950/95 border-red-800 text-red-300'
          }`}
        >
          <div className="flex items-start gap-2">
            {result.success ? (
              <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <div className="flex-1">
              <p className="text-xs font-semibold">{result.success ? result.message : result.error}</p>
            </div>
            <button
              onClick={() => {
                setResult(null);
                setActionType(null);
              }}
              className="text-slate-400 hover:text-slate-300 transition-colors"
              aria-label="Fechar mensagem"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
