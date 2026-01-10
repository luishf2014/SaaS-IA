/**
 * Formulário para criar novo usuário
 * 
 * FASE 7: CRUD Administrativo Seguro
 * 
 * Client Component que chama Server Action protegida por RBAC.
 * UI apenas coleta dados e exibe feedback, nunca decide permissões.
 */

'use client';

import { useState } from 'react';
import { createUser, type AdminActionResult } from './actions';

export default function CreateUserForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdminActionResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await createUser(email, password, role);
      setResult(response);

      if (response.success) {
        // Limpar formulário em caso de sucesso
        setEmail('');
        setPassword('');
        setRole('user');
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
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Criar Novo Usuário</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 disabled:opacity-50"
              placeholder="usuario@exemplo.com"
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 disabled:opacity-50"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white disabled:opacity-50"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Botão Submit */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Criando...' : 'Criar Usuário'}
          </button>
        </div>

        {/* Feedback */}
        {result && (
          <div
            className={`p-4 rounded-lg border ${
              result.success
                ? 'bg-green-950/50 border-green-800 text-green-300'
                : 'bg-red-950/50 border-red-800 text-red-300'
            }`}
          >
            {result.success ? (
              <p className="text-sm font-semibold">{result.message}</p>
            ) : (
              <p className="text-sm font-semibold">{result.error}</p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
