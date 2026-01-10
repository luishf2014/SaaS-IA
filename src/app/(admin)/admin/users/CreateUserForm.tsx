/**
 * Formulário para criar novo usuário
 * 
 * FASE 7: CRUD Administrativo Seguro
 * FASE 9: Funcionalidades Administrativas Avançadas
 * 
 * Client Component que chama Server Action protegida por RBAC.
 * UI apenas coleta dados e exibe feedback, nunca decide permissões.
 */

'use client';

import { useState, useEffect } from 'react';
import { createUser, type AdminActionResult } from './actions';

export default function CreateUserForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdminActionResult | null>(null);

  // FASE 9: Auto-dismiss de mensagens de sucesso
  useEffect(() => {
    if (result?.success) {
      const timer = setTimeout(() => {
        setResult(null);
      }, 5000); // 5 segundos
      return () => clearTimeout(timer);
    }
  }, [result]);

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
        error: error instanceof Error ? error.message : 'Erro desconhecido ao criar usuário',
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

        {/* Feedback - FASE 9: Melhorado */}
        {result && (
          <div
            className={`p-4 rounded-lg border transition-all ${
              result.success
                ? 'bg-green-950/50 border-green-800 text-green-300'
                : 'bg-red-950/50 border-red-800 text-red-300'
            }`}
          >
            <div className="flex items-start gap-2">
              {result.success ? (
                <>
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{result.message}</p>
                    {result.success && (
                      <p className="text-xs text-green-400/70 mt-1">Esta mensagem desaparecerá automaticamente em alguns segundos.</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{result.error}</p>
                  </div>
                </>
              )}
              <button
                onClick={() => setResult(null)}
                className="text-slate-400 hover:text-slate-300 transition-colors"
                aria-label="Fechar mensagem"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
