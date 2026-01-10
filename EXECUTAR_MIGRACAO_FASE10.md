# 🚀 Executar Migração FASE 10 - Tabelas Financeiras

## ⚠️ IMPORTANTE

Execute esta migração SQL **ANTES** de testar o Dashboard com dados financeiros.

Esta migração cria as tabelas necessárias para:
- ✅ Armazenar vendas (`sales`)
- ✅ Armazenar despesas (`expenses`)
- ✅ Isolamento multi-tenant via RLS
- ✅ Dashboard funcional com dados reais

## 📋 Passo a Passo

1. **Acesse o Supabase Dashboard**:
   - https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**:
   - Clique em **SQL Editor** no menu lateral
   - Clique em **New Query**

3. **Execute a Migração**:
   - Abra o arquivo: `supabase/migrations/003_fase10_financial_tables.sql`
   - **Copie TODO o conteúdo**
   - Cole no SQL Editor
   - Clique em **RUN** (ou pressione Ctrl+Enter)
   - Aguarde aparecer "Success" ✅

4. **Verifique as Tabelas**:
   - Vá em **Table Editor**
   - Você deve ver duas novas tabelas:
     - `sales`
     - `expenses`

5. **Verifique as Policies RLS**:
   - Vá em **Table Editor** → clique em uma tabela → **Policies**
   - Você deve ver policies criadas para `sales` e `expenses`

## ✅ O que a Migração Cria

### Tabelas

- **`sales`** (Vendas):
  - `id` (uuid, PK)
  - `company_id` (uuid, FK → companies)
  - `amount` (decimal, não negativo)
  - `description` (text, opcional)
  - `sale_date` (date, default hoje)
  - `created_at` (timestamp)
  - `updated_at` (timestamp, auto-atualizado)

- **`expenses`** (Despesas):
  - `id` (uuid, PK)
  - `company_id` (uuid, FK → companies)
  - `amount` (decimal, não negativo)
  - `description` (text, opcional)
  - `expense_date` (date, default hoje)
  - `category` (text, opcional)
  - `created_at` (timestamp)
  - `updated_at` (timestamp, auto-atualizado)

### Índices

- `sales_company_id_idx` - Performance em buscas por empresa
- `sales_sale_date_idx` - Performance em filtros por data
- `expenses_company_id_idx` - Performance em buscas por empresa
- `expenses_expense_date_idx` - Performance em filtros por data
- `expenses_category_idx` - Performance em filtros por categoria

### Row Level Security (RLS)

**Sales:**
- ✅ Usuário pode ver/criar/atualizar/deletar vendas da própria empresa
- ✅ Isolamento total: nenhum acesso cross-company

**Expenses:**
- ✅ Usuário pode ver/criar/atualizar/deletar despesas da própria empresa
- ✅ Isolamento total: nenhum acesso cross-company

### Triggers

- `update_sales_updated_at` - Atualiza `updated_at` automaticamente
- `update_expenses_updated_at` - Atualiza `updated_at` automaticamente

## 🔐 Segurança

As policies RLS garantem que:
- ✅ Usuários só veem dados da própria empresa
- ✅ Usuários só podem criar/atualizar/deletar dados da própria empresa
- ✅ Nenhum acesso cruzado entre empresas é possível
- ✅ RLS é a última linha de defesa (além do RBAC no código)

## 📝 Adicionar Dados de Teste (Opcional)

Para testar o Dashboard, você pode adicionar dados manualmente:

### Exemplo de Venda:
```sql
INSERT INTO public.sales (company_id, amount, description, sale_date)
VALUES (
  'seu-company-id-aqui',
  1500.00,
  'Venda de produto X',
  CURRENT_DATE
);
```

### Exemplo de Despesa:
```sql
INSERT INTO public.expenses (company_id, amount, description, category, expense_date)
VALUES (
  'seu-company-id-aqui',
  500.00,
  'Aluguel do escritório',
  'Operacional',
  CURRENT_DATE
);
```

**Para encontrar seu `company_id`:**
- Vá em **Table Editor** → `profiles`
- Encontre seu `user_id` na tabela
- O `company_id` associado é o ID da sua empresa

## ❌ Se Algo Der Errado

- Verifique se você está no projeto correto do Supabase
- Verifique se copiou TODO o conteúdo do arquivo SQL
- Verifique se não há erros no console do SQL Editor
- Se necessário, execute novamente (é seguro executar múltiplas vezes - é idempotente)

## ✅ Validação Pós-Migração

Após executar a migração, teste:

1. **Acesse o Dashboard**:
   - Faça login
   - Acesse `/dashboard`
   - Verifique que não há erros

2. **Adicione Dados**:
   - Adicione algumas vendas e despesas manualmente no Supabase
   - Recarregue o Dashboard
   - Verifique que as métricas aparecem corretamente

3. **Teste Filtros**:
   - Use os filtros de período no Dashboard
   - Verifique que os dados são filtrados corretamente

---

**Após executar a migração, o Dashboard está pronto para exibir dados financeiros reais!** 🎉
