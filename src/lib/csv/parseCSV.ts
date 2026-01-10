/**
 * Parser de CSV (Server-Only)
 * 
 * FASE 11: Upload e Ingestão de Dados (CSV)
 * 
 * Função utilitária para parsear arquivos CSV no servidor.
 * Processa CSV linha por linha e retorna array de objetos.
 * 
 * IMPORTANTE: Este módulo é SERVER-ONLY.
 */

import 'server-only';

/**
 * Resultado do parse de uma linha CSV
 */
export type ParsedCSVRow = Record<string, string>;

/**
 * Resultado do parse completo do CSV
 */
export type ParsedCSV = {
  headers: string[];
  rows: ParsedCSVRow[];
  errors: string[];
};

/**
 * Parseia um arquivo CSV
 * 
 * @param fileContent - Conteúdo do arquivo CSV como string
 * @returns Objeto com headers, rows e erros
 */
export function parseCSV(fileContent: string): ParsedCSV {
  const errors: string[] = [];
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    errors.push('Arquivo CSV vazio');
    return { headers: [], rows: [], errors };
  }

  // Primeira linha são os headers
  const headers = parseCSVLine(lines[0]);
  
  if (headers.length === 0) {
    errors.push('CSV não possui headers válidos');
    return { headers: [], rows: [], errors };
  }

  // Normalizar headers (trim, lowercase)
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());

  // Parsear linhas restantes
  const rows: ParsedCSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const lineValues = parseCSVLine(lines[i]);
    
    if (lineValues.length !== normalizedHeaders.length) {
      errors.push(`Linha ${i + 1}: número de colunas não corresponde aos headers (esperado ${normalizedHeaders.length}, encontrado ${lineValues.length})`);
      continue;
    }

    const row: ParsedCSVRow = {};
    normalizedHeaders.forEach((header, index) => {
      row[header] = lineValues[index]?.trim() || '';
    });

    rows.push(row);
  }

  return {
    headers: normalizedHeaders,
    rows,
    errors,
  };
}

/**
 * Parseia uma linha CSV, lidando com valores entre aspas
 * 
 * @param line - Linha do CSV
 * @returns Array de valores
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote dentro de aspas
        currentValue += '"';
        i++; // Pular próximo caractere
      } else {
        // Toggle inside quotes
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Separador de campo
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Adicionar último valor
  values.push(currentValue);

  return values;
}
