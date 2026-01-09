/**
 * Componente de formulário de registro (Client Component)
 * 
 * Gerencia estado do formulário e chama Server Action
 */

'use client';

import { signUp } from '../actions';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validação básica no frontend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, insira um e-mail válido');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password);
      
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // Se sucesso, o redirect acontece automaticamente na Server Action
    } catch (err) {
      setError('Erro inesperado ao criar conta');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Criar nova conta
            </h1>
            <p className="text-slate-400">
              Comece sua jornada com inteligência de negócios
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-slate-500 disabled:opacity-50"
                placeholder="seu@email.com"
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
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
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-slate-500 disabled:opacity-50"
                placeholder="••••••••"
              />
              <p className="text-slate-500 text-sm mt-1">
                Mínimo de 6 caracteres
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botão de Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="text-blue-500 hover:text-blue-400 font-semibold transition-colors"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-8">
          SaaS B2B - Inteligência de Negócios com IA
        </p>
      </div>
    </div>
  );
}
