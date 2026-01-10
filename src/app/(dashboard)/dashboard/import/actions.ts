/**
 * Server Actions para Importação de CSV
 * 
 * FASE 11: Upload e Ingestão de Dados (CSV)
 * 
 * Todas as ações são protegidas por RBAC usando requirePermission().
 * Nenhuma importação ocorre antes da verificação de permissão.
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY e nunca deve ser importado em Client Components.
 */

'use server';

import 'server-only';

import { requirePermission, PERMISSIONS } from '@/lib/rbac';
import { createClient } from '@/lib/supabase/server';
import { getUserProfile } from '@/lib/profile';
import { revalidatePath } from 'next/cache';
import { parseCSV } from '@/lib/csv/parseCSV';
import { validateSalesRow, validateExpensesRow } from '@/lib/csv/validators';

/**
 * Resultado de uma importação CSV
 */
export type ImportResult = {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errors?: string[];
  message?: string;
};

/**
 * Importa vendas (sales) de um arquivo CSV
 * 
 * FASE 11: Server Action protegida por RBAC
 * 
 * Formato esperado do CSV:
 * - Colunas obrigatórias: amount, sale_date
 * - Colunas opcionais: description
 * 
 * @param formData - FormData contendo o arquivo CSV
 * @returns Resultado da importação
 */
export async function importSalesFromCSV(formData: FormData): Promise<ImportResult> {
  // HARDENING: Verificar permissão ANTES de qualquer operação (PRIMEIRA LINHA)
  await requirePermission(PERMISSIONS.CSV_UPLOAD);

  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['Nenhum arquivo foi enviado'],
      };
    }

    // Validar tipo de arquivo
    if (!file.name.endsWith('.csv')) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['Arquivo deve ser um CSV (.csv)'],
      };
    }

    // Obter company do usuário autenticado
    const userProfile = await getUserProfile();
    if (!userProfile?.company?.id) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['Não foi possível identificar sua empresa. Faça login novamente.'],
      };
    }

    // Ler conteúdo do arquivo
    const fileContent = await file.text();

    // Parsear CSV
    const parsed = parseCSV(fileContent);

    if (parsed.errors.length > 0 && parsed.rows.length === 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['Erro ao processar CSV: ' + parsed.errors.join(', ')],
      };
    }

    // Validar headers obrigatórios
    const requiredHeaders = ['amount', 'sale_date'];
    const missingHeaders = requiredHeaders.filter(h => !parsed.headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: [`CSV deve conter as colunas: ${requiredHeaders.join(', ')}. Faltando: ${missingHeaders.join(', ')}`],
      };
    }

    // Validar e processar linhas
    const validData: Array<{
      amount: string;
      description: string | null;
      sale_date: string;
    }> = [];
    const errors: string[] = [...parsed.errors];

    parsed.rows.forEach((row, index) => {
      const validation = validateSalesRow(row, index + 2); // +2 porque linha 1 é header
      
      if (validation.valid && validation.data) {
        validData.push({
          amount: validation.data.amount as string,
          description: validation.data.description as string | null,
          sale_date: validation.data.sale_date as string,
        });
      } else {
        errors.push(...validation.errors);
      }
    });

    if (validData.length === 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: parsed.rows.length,
        errors: errors.length > 0 ? errors : ['Nenhuma linha válida encontrada no CSV'],
      };
    }

    // Inserir dados no banco
    const supabase = await createClient();
    const insertData = validData.map(data => ({
      company_id: userProfile.company.id,
      amount: data.amount,
      description: data.description,
      sale_date: data.sale_date,
    }));

    const { error: insertError } = await supabase
      .from('sales')
      .insert(insertData);

    if (insertError) {
      console.error('[importSalesFromCSV] Erro ao inserir dados:', insertError);
      return {
        success: false,
        importedCount: 0,
        skippedCount: parsed.rows.length,
        errors: ['Erro ao salvar dados no banco. Tente novamente.'],
      };
    }

    // AUDITORIA: Registrar ação
    console.log('[CSV_IMPORT]', {
      action: 'IMPORT_SALES',
      companyId: userProfile.company.id,
      userId: userProfile.profile.user_id,
      importedCount: validData.length,
      skippedCount: parsed.rows.length - validData.length,
      timestamp: new Date().toISOString(),
    });

    // Revalidar dashboard
    revalidatePath('/dashboard');

    return {
      success: true,
      importedCount: validData.length,
      skippedCount: parsed.rows.length - validData.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${validData.length} venda(s) importada(s) com sucesso${errors.length > 0 ? ` (${errors.length} linha(s) ignorada(s))` : ''}`,
    };
  } catch (error) {
    console.error('[importSalesFromCSV] Erro inesperado:', error);
    return {
      success: false,
      importedCount: 0,
      skippedCount: 0,
      errors: ['Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.'],
    };
  }
}

/**
 * Importa despesas (expenses) de um arquivo CSV
 * 
 * FASE 11: Server Action protegida por RBAC
 * 
 * Formato esperado do CSV:
 * - Colunas obrigatórias: amount, expense_date
 * - Colunas opcionais: description, category
 * 
 * @param formData - FormData contendo o arquivo CSV
 * @returns Resultado da importação
 */
export async function importExpensesFromCSV(formData: FormData): Promise<ImportResult> {
  // HARDENING: Verificar permissão ANTES de qualquer operação (PRIMEIRA LINHA)
  await requirePermission(PERMISSIONS.CSV_UPLOAD);

  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['Nenhum arquivo foi enviado'],
      };
    }

    // Validar tipo de arquivo
    if (!file.name.endsWith('.csv')) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['Arquivo deve ser um CSV (.csv)'],
      };
    }

    // Obter company do usuário autenticado
    const userProfile = await getUserProfile();
    if (!userProfile?.company?.id) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['Não foi possível identificar sua empresa. Faça login novamente.'],
      };
    }

    // Ler conteúdo do arquivo
    const fileContent = await file.text();

    // Parsear CSV
    const parsed = parseCSV(fileContent);

    if (parsed.errors.length > 0 && parsed.rows.length === 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: ['Erro ao processar CSV: ' + parsed.errors.join(', ')],
      };
    }

    // Validar headers obrigatórios
    const requiredHeaders = ['amount', 'expense_date'];
    const missingHeaders = requiredHeaders.filter(h => !parsed.headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: [`CSV deve conter as colunas: ${requiredHeaders.join(', ')}. Faltando: ${missingHeaders.join(', ')}`],
      };
    }

    // Validar e processar linhas
    const validData: Array<{
      amount: string;
      description: string | null;
      expense_date: string;
      category: string | null;
    }> = [];
    const errors: string[] = [...parsed.errors];

    parsed.rows.forEach((row, index) => {
      const validation = validateExpensesRow(row, index + 2); // +2 porque linha 1 é header
      
      if (validation.valid && validation.data) {
        validData.push({
          amount: validation.data.amount as string,
          description: validation.data.description as string | null,
          expense_date: validation.data.expense_date as string,
          category: validation.data.category as string | null,
        });
      } else {
        errors.push(...validation.errors);
      }
    });

    if (validData.length === 0) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: parsed.rows.length,
        errors: errors.length > 0 ? errors : ['Nenhuma linha válida encontrada no CSV'],
      };
    }

    // Inserir dados no banco
    const supabase = await createClient();
    const insertData = validData.map(data => ({
      company_id: userProfile.company.id,
      amount: data.amount,
      description: data.description,
      expense_date: data.expense_date,
      category: data.category,
    }));

    const { error: insertError } = await supabase
      .from('expenses')
      .insert(insertData);

    if (insertError) {
      console.error('[importExpensesFromCSV] Erro ao inserir dados:', insertError);
      return {
        success: false,
        importedCount: 0,
        skippedCount: parsed.rows.length,
        errors: ['Erro ao salvar dados no banco. Tente novamente.'],
      };
    }

    // AUDITORIA: Registrar ação
    console.log('[CSV_IMPORT]', {
      action: 'IMPORT_EXPENSES',
      companyId: userProfile.company.id,
      userId: userProfile.profile.user_id,
      importedCount: validData.length,
      skippedCount: parsed.rows.length - validData.length,
      timestamp: new Date().toISOString(),
    });

    // Revalidar dashboard
    revalidatePath('/dashboard');

    return {
      success: true,
      importedCount: validData.length,
      skippedCount: parsed.rows.length - validData.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `${validData.length} despesa(s) importada(s) com sucesso${errors.length > 0 ? ` (${errors.length} linha(s) ignorada(s))` : ''}`,
    };
  } catch (error) {
    console.error('[importExpensesFromCSV] Erro inesperado:', error);
    return {
      success: false,
      importedCount: 0,
      skippedCount: 0,
      errors: ['Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte.'],
    };
  }
}
