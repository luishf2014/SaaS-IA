# 🚀 Executar Migração FASE 8 - Infraestrutura de Dados

## ⚠️ IMPORTANTE

Execute esta migração SQL **ANTES** de testar funcionalidades administrativas (FASE 7).

Esta migração cria o schema completo necessário para:
- ✅ `ensureUserProfile()` funcionar
- ✅ CRUD administrativo de usuários funcionar
- ✅ Isolamento multi-tenant por company

## 📋 Passo a Passo

1. **Acesse o Supabase Dashboard**:
   - https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**:
   - Clique em **SQL Editor** no menu lateral
   - Clique em **New Query**

3. **Execute a Migração**:
   - Abra o arquivo: `supabase/migrations/002_fase8_complete_schema.sql`
   - **Copie TODO o conteúdo**
   - Cole no SQL Editor
   - Clique em **RUN** (ou pressione Ctrl+Enter)
   - Aguarde aparecer "Success" ✅

4. **Verifique as Tabelas**:
   - Vá em **Table Editor**
   - Você deve ver duas tabelas:
     - `companies`
     - `profiles`

5. **Verifique as Policies RLS**:
   - Vá em **Authentication** → **Policies**
   - Ou em **Table Editor** → clique em uma tabela → **Policies**
   - Você deve ver as policies criadas para `companies` e `profiles`

## ✅ O que a Migração Cria

### Tabelas

- **`companies`**:
  - `id` (uuid, PK)
  - `name` (text, not null)
  - `owner_id` (uuid, FK → auth.users)
  - `created_at` (timestamp)

- **`profiles`**:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK → auth.users, UNIQUE)
  - `company_id` (uuid, FK → companies)
  - `role` (text: 'admin' | 'user')
  - `created_at` (timestamp)

### Índices

- `companies_owner_id_idx` - Performance em buscas por owner
- `companies_created_at_idx` - Performance em ordenação
- `profiles_user_id_idx` - Performance em buscas por usuário
- `profiles_company_id_idx` - Performance em buscas por company
- `profiles_role_idx` - Performance em filtros por role

### Row Level Security (RLS)

**Companies:**
- ✅ Usuário pode ver/criar/atualizar sua própria company
- ✅ Usuário pode ver company através do profile

**Profiles:**
- ✅ Usuário pode ver/criar/atualizar seu próprio profile
- ✅ Admin pode ver/criar/atualizar/deletar profiles da mesma company
- ✅ Isolamento total: nenhum acesso cross-company

## 🔐 Segurança

As policies RLS garantem que:
- ✅ Usuários só veem suas próprias companies
- ✅ Usuários só veem seus próprios profiles (exceto admin da mesma company)
- ✅ Admin só gerencia usuários da mesma company
- ✅ Nenhum acesso cruzado entre companies é possível
- ✅ Admin não pode deletar a si mesmo

## ❌ Se Algo Der Errado

- Verifique se você está no projeto correto do Supabase
- Verifique se copiou TODO o conteúdo do arquivo SQL
- Verifique se não há erros no console do SQL Editor
- Se necessário, execute novamente (é seguro executar múltiplas vezes - é idempotente)

## ✅ Validação Pós-Migração

Após executar a migração, teste:

1. **Registre um novo usuário**:
   - Acesse `/register`
   - Crie uma conta
   - Verifique no Supabase que `company` e `profile` foram criados automaticamente

2. **Teste CRUD Administrativo**:
   - Faça login com usuário admin
   - Acesse `/admin/users`
   - Tente criar/editar/deletar usuários
   - Verifique que tudo funciona corretamente

---

**Após executar a migração, o sistema está pronto para todas as funcionalidades até a FASE 7!** 🎉
