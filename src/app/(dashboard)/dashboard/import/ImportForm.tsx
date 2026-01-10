/**
 * Formulário de Upload de CSV
 * 
 * FASE 11: Upload e Ingestão de Dados (CSV)
 * 
 * Client Component para upload de arquivos CSV.
 * UI apenas coleta dados e exibe feedback, nunca decide permissões.
 */

'use client';

import { useState, useRef } from 'react';
import { importSalesFromCSV, importExpensesFromCSV, type ImportResult } from './actions';

type ImportType = 'sales' | 'expenses';

export default function ImportForm() {
  const [importType, setImportType] = useState<ImportType>('sales');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setResult({
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['Selecione um arquivo CSV'],
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = importType === 'sales'
        ? await importSalesFromCSV(formData)
        : await importExpensesFromCSV(formData);

      setResult(response);

      if (response.success) {
        // Limpar formulário em caso de sucesso
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setResult({
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido ao importar CSV'],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
      <h2 className="text-xl font-bold text-white mb-4">Importar Dados via CSV</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Importação */}
        <div>
          <label htmlFor="importType" className="block text-sm font-medium text-slate-300 mb-2">
            Tipo de Dados
          </label>
          <select
            id="importType"
            value={importType}
            onChange={(e) => {
              setImportType(e.target.value as ImportType);
              setResult(null);
            }}
            disabled={loading}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="sales">Vendas</option>
            <option value="expenses">Despesas</option>
          </select>
        </div>

        {/* Informações sobre o formato */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">
            Formato esperado do CSV:
          </h3>
          {importType === 'sales' ? (
            <div className="text-xs text-slate-400 space-y-1">
              <p><strong className="text-slate-300">Colunas obrigatórias:</strong> amount, sale_date</p>
              <p><strong className="text-slate-300">Colunas opcionais:</strong> description</p>
              <p className="mt-2 text-slate-500">Exemplo:</p>
              <pre className="bg-slate-900 p-2 rounded text-slate-300 mt-1 overflow-x-auto">
{`amount,description,sale_date
1500.00,Venda de produto X,2024-01-15
2300.50,Venda de produto Y,2024-01-16`}
              </pre>
            </div>
          ) : (
            <div className="text-xs text-slate-400 space-y-1">
              <p><strong className="text-slate-300">Colunas obrigatórias:</strong> amount, expense_date</p>
              <p><strong className="text-slate-300">Colunas opcionais:</strong> description, category</p>
              <p className="mt-2 text-slate-500">Exemplo:</p>
              <pre className="bg-slate-900 p-2 rounded text-slate-300 mt-1 overflow-x-auto">
{`amount,description,expense_date,category
500.00,Aluguel do escritório,2024-01-15,Operacional
200.00,Internet,2024-01-16,Operacional`}
              </pre>
            </div>
          )}
        </div>

        {/* Upload de Arquivo */}
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-slate-300 mb-2">
            Arquivo CSV
          </label>
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={loading}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
          />
          {file && (
            <p className="mt-2 text-xs text-slate-400">
              Arquivo selecionado: <span className="text-slate-300">{file.name}</span>
            </p>
          )}
        </div>

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={loading || !file}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Importando...' : 'Importar CSV'}
        </button>

        {/* Feedback */}
        {result && (
          <div
            className={`p-4 rounded-lg border ${
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
                    <p className="text-xs mt-1 text-green-400/70">
                      {result.importedCount} linha(s) importada(s)
                      {result.skippedCount > 0 && ` • ${result.skippedCount} linha(s) ignorada(s)`}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Erro ao importar CSV</p>
                    {result.errors && result.errors.length > 0 && (
                      <ul className="text-xs mt-2 space-y-1 list-disc list-inside">
                        {result.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li className="text-slate-500">... e mais {result.errors.length - 5} erro(s)</li>
                        )}
                      </ul>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
