/**
 * Validadores de Dados CSV (Server-Only)
 * 
 * FASE 11: Upload e Ingestão de Dados (CSV)
 * 
 * Funções de validação para dados financeiros importados via CSV.
 * Garante integridade dos dados antes da inserção no banco.
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY.
 */

import 'server-only';

/**
 * Resultado da validação de uma linha
 */
export type ValidationResult = {
  valid: boolean;
  errors: string[];
  data?: Record<string, unknown>;
};

/**
 * Valida uma linha de vendas (sales)
 * 
 * Colunas esperadas:
 * - amount (obrigatório, numérico, >= 0)
 * - description (opcional)
 * - sale_date (obrigatório, data válida)
 * 
 * @param row - Linha parseada do CSV
 * @param lineNumber - Número da linha (para mensagens de erro)
 * @returns Resultado da validação
 */
export function validateSalesRow(row: Record<string, string>, lineNumber: number): ValidationResult {
  const errors: string[] = [];

  // Validar amount
  const amountStr = row.amount || row.amount || '';
  if (!amountStr) {
    errors.push(`Linha ${lineNumber}: campo 'amount' é obrigatório`);
  } else {
    const amount = parseFloat(amountStr.replace(',', '.').replace(/[^\d.-]/g, ''));
    if (isNaN(amount)) {
      errors.push(`Linha ${lineNumber}: campo 'amount' deve ser um número válido`);
    } else if (amount < 0) {
      errors.push(`Linha ${lineNumber}: campo 'amount' não pode ser negativo`);
    }
  }

  // Validar sale_date
  const dateStr = row.sale_date || row['sale_date'] || '';
  if (!dateStr) {
    errors.push(`Linha ${lineNumber}: campo 'sale_date' é obrigatório`);
  } else {
    const parsedDate = parseDate(dateStr);
    if (!parsedDate) {
      errors.push(`Linha ${lineNumber}: campo 'sale_date' deve ser uma data válida (formato: YYYY-MM-DD ou DD/MM/YYYY)`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Montar objeto validado
  const amount = parseFloat((row.amount || row.amount || '0').replace(',', '.').replace(/[^\d.-]/g, ''));
  const parsedDate = parseDate(row.sale_date || row['sale_date'] || '');
  const description = (row.description || row['description'] || '').trim();

  return {
    valid: true,
    errors: [],
    data: {
      amount: amount.toFixed(2),
      description: description || null,
      sale_date: parsedDate?.toISOString().split('T')[0] || null,
    },
  };
}

/**
 * Valida uma linha de despesas (expenses)
 * 
 * Colunas esperadas:
 * - amount (obrigatório, numérico, >= 0)
 * - description (opcional)
 * - expense_date (obrigatório, data válida)
 * - category (opcional)
 * 
 * @param row - Linha parseada do CSV
 * @param lineNumber - Número da linha (para mensagens de erro)
 * @returns Resultado da validação
 */
export function validateExpensesRow(row: Record<string, string>, lineNumber: number): ValidationResult {
  const errors: string[] = [];

  // Validar amount
  const amountStr = row.amount || row['amount'] || '';
  if (!amountStr) {
    errors.push(`Linha ${lineNumber}: campo 'amount' é obrigatório`);
  } else {
    const amount = parseFloat(amountStr.replace(',', '.').replace(/[^\d.-]/g, ''));
    if (isNaN(amount)) {
      errors.push(`Linha ${lineNumber}: campo 'amount' deve ser um número válido`);
    } else if (amount < 0) {
      errors.push(`Linha ${lineNumber}: campo 'amount' não pode ser negativo`);
    }
  }

  // Validar expense_date
  const dateStr = row.expense_date || row['expense_date'] || '';
  if (!dateStr) {
    errors.push(`Linha ${lineNumber}: campo 'expense_date' é obrigatório`);
  } else {
    const parsedDate = parseDate(dateStr);
    if (!parsedDate) {
      errors.push(`Linha ${lineNumber}: campo 'expense_date' deve ser uma data válida (formato: YYYY-MM-DD ou DD/MM/YYYY)`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Montar objeto validado
  const amount = parseFloat((row.amount || row['amount'] || '0').replace(',', '.').replace(/[^\d.-]/g, ''));
  const parsedDate = parseDate(row.expense_date || row['expense_date'] || '');
  const description = (row.description || row['description'] || '').trim();
  const category = (row.category || row['category'] || '').trim();

  return {
    valid: true,
    errors: [],
    data: {
      amount: amount.toFixed(2),
      description: description || null,
      expense_date: parsedDate?.toISOString().split('T')[0] || null,
      category: category || null,
    },
  };
}

/**
 * Parseia uma data em formato ISO (YYYY-MM-DD) ou BR (DD/MM/YYYY)
 * 
 * @param dateStr - String da data
 * @returns Date object ou null se inválida
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Tentar formato ISO (YYYY-MM-DD)
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const date = new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Tentar formato BR (DD/MM/YYYY)
  const brMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    const date = new Date(parseInt(brMatch[3]), parseInt(brMatch[2]) - 1, parseInt(brMatch[1]));
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}
