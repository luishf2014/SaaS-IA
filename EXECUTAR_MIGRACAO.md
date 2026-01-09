# 🚀 Executar Migração - Companies e Profiles

## ⚠️ IMPORTANTE

Execute esta migração SQL **ANTES** de testar o sistema pela primeira vez.

## 📋 Passo a Passo

1. **Acesse o Supabase Dashboard**:
   - https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**:
   - Clique em **SQL Editor** no menu lateral
   - Clique em **New Query**

3. **Execute a Migração**:
   - Abra o arquivo: `supabase/migrations/001_create_companies_and_profiles.sql`
   - **Copie TODO o conteúdo**
   - Cole no SQL Editor
   - Clique em **RUN** (ou pressione Ctrl+Enter)
   - Aguarde aparecer "Success" ✅

4. **Verifique as Tabelas**:
   - Vá em **Table Editor**
   - Você deve ver duas novas tabelas:
     - `companies`
     - `profiles`

5. **Teste o Sistema**:
   - Registre um novo usuário
   - Faça login
   - Acesse o dashboard
   - Verifique que company e profile foram criados automaticamente

## ✅ O que a Migração Cria

- **Tabela `companies`**: Armazena empresas dos usuários
- **Tabela `profiles`**: Armazena perfis dos usuários
- **Row Level Security (RLS)**: Isolamento total de dados
- **Índices**: Para performance
- **Constraints**: Para integridade de dados

## 🔐 Segurança

As policies RLS garantem que:
- Usuários só veem suas próprias companies
- Usuários só veem seus próprios profiles
- Nenhum acesso cruzado é possível

## ❌ Se Algo Der Errado

- Verifique se você está no projeto correto do Supabase
- Verifique se copiou TODO o conteúdo do arquivo SQL
- Verifique se não há erros no console do SQL Editor
- Se necessário, execute novamente (é seguro executar múltiplas vezes)

---

**Após executar a migração, o sistema está pronto para criar companies e profiles automaticamente!** 🎉
