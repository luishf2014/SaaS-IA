/**
 * Componente de ações para usuário (editar role, deletar)
 * 
 * FASE 7: CRUD Administrativo Seguro
 * 
 * Client Component que chama Server Actions protegidas por RBAC.
 * UI apenas coleta dados e exibe feedback, nunca decide permissões.
 */

'use client';

import { useState } from 'react';
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

  const handleUpdateRole = async (newRole: 'admin' | 'user') => {
    if (newRole === currentRole) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await updateUserRole(profileId, newRole);
      setResult(response);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await deleteUser(userId);
      setResult(response);
      if (response.success) {
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Dropdown de Role */}
      <select
        value={currentRole}
        onChange={(e) => handleUpdateRole(e.target.value as 'admin' | 'user')}
        disabled={loading}
        className="px-3 py-1 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50 focus:ring-2 focus:ring-blue-500"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      {/* Botão Deletar */}
      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="px-3 py-1 text-sm bg-red-950/50 border border-red-800 text-red-400 hover:bg-red-900/50 rounded-lg disabled:opacity-50 transition-colors"
        >
          Deletar
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Confirmar?</span>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            Sim
          </button>
          <button
            onClick={() => {
              setShowDeleteConfirm(false);
              setResult(null);
            }}
            disabled={loading}
            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            Não
          </button>
        </div>
      )}

      {/* Feedback */}
      {result && (
        <div
          className={`text-xs px-2 py-1 rounded ${
            result.success
              ? 'bg-green-950/50 text-green-300'
              : 'bg-red-950/50 text-red-300'
          }`}
        >
          {result.success ? result.message : result.error}
        </div>
      )}
    </div>
  );
}
