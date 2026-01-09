/**
 * Página de teste de conexão com Supabase
 * 
 * Testa a conexão real com o Supabase fazendo uma query SELECT simples
 * na tabela obrigatória `health_check`.
 * 
 * IMPORTANTE: A tabela `health_check` DEVE existir no banco de dados.
 * Crie a tabela no Supabase SQL Editor antes de testar.
 * 
 * Será removida após validação da FASE 2.
 */

import { createClient } from '@/lib/supabase/server';

export default async function TestConnectionPage() {
  let connectionStatus = 'Testando conexão...';
  let errorMessage: string | null = null;
  let queryResult: string | null = null;
  let isSuccess = false;

  try {
    const supabase = await createClient();
    
    // Query simples: SELECT na tabela obrigatória health_check
    // Sem RPC, sem SQL customizado, apenas SELECT + LIMIT
    const { data, error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);

    if (error) {
      // Qualquer erro significa falha na conexão ou tabela não existe
      throw error;
    }

    // Sucesso: query executada sem erros
    connectionStatus = '✅ Conexão estabelecida com sucesso!';
    isSuccess = true;
    queryResult = data && data.length > 0 
      ? `Query executada com sucesso. ${data.length} registro(s) encontrado(s).`
      : 'Query executada com sucesso. Tabela vazia.';

  } catch (error: unknown) {
    connectionStatus = '❌ Erro na conexão';
    isSuccess = false;
    
    const err = error instanceof Error ? error : new Error(String(error));
    const errorCode = (error as any)?.code || 'UNKNOWN';
    
    // Mensagem de erro específica baseada no código
    if (errorCode === '42P01' || errorCode === 'PGRST116') {
      errorMessage = 'Tabela health_check não encontrada. Crie a tabela no Supabase SQL Editor.';
    } else if (errorCode === 'PGRST301' || err.message.includes('JWT')) {
      errorMessage = 'Erro de autenticação. Verifique NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local';
    } else if (err.message.includes('fetch') || err.message.includes('network')) {
      errorMessage = 'Erro de rede. Verifique NEXT_PUBLIC_SUPABASE_URL no .env.local';
    } else {
      errorMessage = err.message || String(error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-900 rounded-xl border border-slate-800 p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">
          Teste de Conexão - Supabase
        </h1>

        <div className="space-y-4">
          {/* Status da Conexão */}
          <div className={`rounded-lg p-4 border ${
            isSuccess 
              ? 'bg-green-950/20 border-green-800' 
              : 'bg-red-950/20 border-red-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Status da Conexão:</span>
              <span className={`font-semibold ${
                isSuccess ? 'text-green-400' : 'text-red-400'
              }`}>
                {connectionStatus}
              </span>
            </div>
          </div>

          {/* Resultado da Query */}
          {isSuccess && queryResult && (
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex flex-col gap-2">
                <span className="text-slate-400 text-sm">Resultado da Query:</span>
                <span className="text-white text-sm">
                  {queryResult}
                </span>
              </div>
            </div>
          )}

          {/* Mensagem de Erro */}
          {!isSuccess && errorMessage && (
            <div className="bg-red-950/50 rounded-lg p-4 border border-red-800">
              <p className="text-red-400 text-sm break-words">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Instruções para criar tabela */}
          {!isSuccess && errorMessage?.includes('health_check') && (
            <div className="bg-blue-950/20 rounded-lg p-4 border border-blue-800">
              <h3 className="text-blue-400 font-semibold mb-2 text-sm">
                Como criar a tabela health_check:
              </h3>
              <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
                <li>Acesse o Supabase Dashboard</li>
                <li>Vá em SQL Editor → New Query</li>
                <li>Execute o SQL abaixo:</li>
              </ol>
              <pre className="mt-3 p-3 bg-slate-900 rounded border border-slate-700 text-xs text-slate-300 overflow-x-auto">
{`CREATE TABLE health_check (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'ok',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO health_check (status) VALUES ('ok');`}
              </pre>
            </div>
          )}

          {/* Variáveis de Ambiente */}
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mt-6">
            <h2 className="text-white font-semibold mb-3 text-sm">Variáveis de Ambiente:</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">NEXT_PUBLIC_SUPABASE_URL:</span>
                <span className={`font-mono ${
                  process.env.NEXT_PUBLIC_SUPABASE_URL 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL 
                    ? '✅ Configurada' 
                    : '❌ Não configurada'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                <span className={`font-mono ${
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                    ? '✅ Configurada' 
                    : '❌ Não configurada'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-500 text-sm text-center">
              Esta página é apenas para teste. Será removida após validação da FASE 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
