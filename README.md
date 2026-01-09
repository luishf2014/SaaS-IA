# SaaS IA - Inteligência de Negócios com IA

> SaaS B2B profissional para transformar dados financeiros em insights acionáveis com Inteligência Artificial.

## 🎯 Objetivo

Sistema completo de Business Intelligence voltado para pequenas e médias empresas, capaz de:
- Processar dados financeiros reais (vendas e despesas)
- Gerar insights acionáveis através de IA
- Fornecer dashboards profissionais e intuitivos
- Garantir isolamento multi-tenant completo

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Autenticação**: Supabase Auth
- **Banco de Dados**: PostgreSQL com Row Level Security

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── login/          # Página de login
│   │   └── register/       # Página de registro
│   │
│   ├── (dashboard)/        # Rotas protegidas
│   │   └── dashboard/      # Dashboard principal
│   │
│   ├── globals.css         # Estilos globais
│   ├── layout.tsx          # Layout raiz
│   └── page.tsx           # Página inicial
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts      # Cliente Supabase (browser)
│   │   └── server.ts      # Cliente Supabase (servidor)
│   └── types.ts           # Tipos TypeScript
│
└── middleware.ts          # Proteção de rotas
```

## 🚀 Fases de Implementação

### ✅ FASE 1: Estrutura Base (CONCLUÍDA)
- Estrutura de pastas organizada
- Configurações base (Next.js, TypeScript, Tailwind)
- Layout e estilos globais
- Rotas básicas preparadas

### ✅ FASE 2: Configurar Supabase (CONCLUÍDA)
- Clientes Supabase implementados (client/server)
- Variáveis de ambiente configuradas
- Teste de conexão real criado
- Compatível com Next.js App Router e @supabase/ssr

### ✅ FASE 3: Autenticação Funcional (CONCLUÍDA)
- Login e registro funcionais
- Sessão persistente via cookies HTTP-only
- Logout funcional
- Proteção de rotas via middleware
- Redirecionamentos automáticos

### ✅ FASE 4: Criação Automática de Perfil (CONCLUÍDA)
- Criação automática de company + profile no primeiro acesso autenticado
- Tabelas companies e profiles criadas no Supabase
- Row Level Security (RLS) implementada para isolamento total
- Bootstrap centralizado em ponto de entrada (src/app/page.tsx)
- Lógica idempotente e previsível
- Sem ação manual do usuário

### ✅ FASE 5: RBAC Real Integrado ao Banco (CONCLUÍDA)
- RBAC agora lê `profiles.role` do banco de dados
- Permissões baseadas em dados reais
- Integração completa com sistema de permissões
- Todas as verificações usam role real do profile
- RBAC nunca cria dados, apenas consome
- `null` significa acesso BLOQUEADO (sem fallback)

### ⏳ FASE 6: Dashboard Funcional
- Métricas financeiras (receita, despesas, lucro)
- Gráficos por período
- Dados reais do banco

### ⏳ FASE 7: Upload de CSV
- Upload e validação de arquivos CSV
- Processamento de vendas e despesas
- Persistência no banco

### ⏳ FASE 8: Integração com IA
- Campo de perguntas em linguagem natural
- Geração de insights financeiros
- Respostas baseadas em dados reais

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Git (opcional)

## 🔧 Instalação

1. **Clone o repositório** (ou use o projeto atual)

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure variáveis de ambiente**:
   
   Crie um arquivo `.env.local` na raiz do projeto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```
   
   **Onde encontrar as credenciais:**
   - Acesse: https://supabase.com/dashboard
   - Selecione seu projeto
   - Vá em **Settings** → **API**
   - Copie **Project URL** e **anon public** key

4. **Execute o projeto**:
```bash
npm run dev
```

5. **Teste a conexão com Supabase**:
   - Acesse: http://localhost:3000/test-connection
   - Você deve ver "✅ Conexão estabelecida com sucesso!"
   - Se houver erro, verifique as variáveis de ambiente

Acesse: http://localhost:3000

## 🎨 Design

O sistema utiliza um design **futurista, profissional e limpo**, com:
- Paleta de cores moderna (slate/blue)
- Tipografia clara e legível
- Layout espaçado e organizado
- Feedback visual para todas as ações
- UX simples e direta

## 🔐 Segurança

- **Row Level Security (RLS)**: Isolamento completo de dados por empresa
- **Multi-tenancy**: Cada usuário pertence a uma empresa única
- **Autenticação segura**: Sessões baseadas em cookies HTTP-only
- **Proteção de rotas**: Middleware valida autenticação em todas as rotas privadas

## 📝 Regras de Desenvolvimento

- ❌ **NÃO** usar dados mock, fake ou estáticos
- ❌ **NÃO** usar funções SQL customizadas
- ❌ **NÃO** usar `supabase.rpc`
- ✅ Usar apenas Supabase (Auth + Postgres + RLS)
- ✅ Backend simples, previsível e debuggável
- ✅ Código limpo e bem documentado

## 📄 Licença

Este projeto foi criado para fins de portfólio profissional e aprendizado.

## ✅ Validação da FASE 2

Para validar que a conexão com Supabase está funcionando:

### Passo 1: Configurar Variáveis de Ambiente

Certifique-se de que `.env.local` está configurado com suas credenciais reais:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Passo 2: Criar Tabela health_check (OBRIGATÓRIA)

A tabela `health_check` é **obrigatória** para o teste funcionar:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** → **New Query**
4. Execute o SQL abaixo:

```sql
CREATE TABLE health_check (
  id SERIAL PRIMARY KEY,
  status TEXT DEFAULT 'ok',
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO health_check (status) VALUES ('ok');
```

### Passo 3: Testar Conexão

1. **Execute o projeto**: `npm run dev`
2. **Acesse**: http://localhost:3000/test-connection
3. **Verifique**:
   - ✅ Status deve mostrar "Conexão estabelecida com sucesso!"
   - ✅ Variáveis de ambiente devem estar marcadas como "Configurada"
   - ✅ Query deve executar e mostrar resultado
   - ❌ Se houver erro, siga as instruções na página de teste

**Importante:** O teste só retorna sucesso se a tabela `health_check` existir e a query executar corretamente.

**Arquivos criados na FASE 2:**
- `src/lib/supabase/client.ts` - Cliente para Client Components
- `src/lib/supabase/server.ts` - Cliente para Server Components/Actions
- `src/app/test-connection/page.tsx` - Página de teste (será removida após validação)

## ✅ Validação da FASE 3

Para validar que a autenticação está funcionando:

1. **Acesse**: http://localhost:3000
2. **Registre uma nova conta**:
   - Vá em "Registre-se" ou acesse `/register`
   - Preencha email e senha (mínimo 6 caracteres)
   - Clique em "Criar conta"
   - Você será redirecionado para `/dashboard`
3. **Teste o login**:
   - Faça logout
   - Acesse `/login`
   - Entre com suas credenciais
   - Você será redirecionado para `/dashboard`
4. **Teste a persistência de sessão**:
   - Faça login
   - Recarregue a página (F5)
   - Você deve permanecer logado
5. **Teste a proteção de rotas**:
   - Faça logout
   - Tente acessar `/dashboard` diretamente
   - Você deve ser redirecionado para `/login`

**Arquivos criados/modificados na FASE 3:**
- `src/app/(auth)/actions.ts` - Server Actions (signUp, signIn, signOut)
- `src/app/(auth)/login/page.tsx` - Página de login funcional
- `src/app/(auth)/register/page.tsx` - Página de registro funcional
- `src/app/(dashboard)/dashboard/page.tsx` - Dashboard protegido
- `src/middleware.ts` - Proteção de rotas privadas
- `src/app/page.tsx` - Redirecionamento baseado em autenticação

---

## ✅ Validação da FASE 4 (Criação Automática de Perfil)

Para validar que a criação automática de perfil está funcionando:

### Passo 1: Executar Migração SQL

1. **Acesse**: https://supabase.com/dashboard
2. **Selecione seu projeto**
3. **Vá em SQL Editor** → **New Query**
4. **Abra o arquivo**: `supabase/migrations/001_create_companies_and_profiles.sql`
5. **Copie TODO o conteúdo** e cole no SQL Editor
6. **Execute** (RUN)
7. **Aguarde**: Deve aparecer "Success" ✅

### Passo 2: Testar Criação Automática

1. **Registre um novo usuário**:
   - Acesse `/register`
   - Crie uma conta nova
   - Você será redirecionado para `/dashboard`

2. **Verifique no Supabase**:
   - Vá em **Table Editor**
   - Verifique a tabela `companies` - deve ter uma entrada
   - Verifique a tabela `profiles` - deve ter uma entrada vinculada

3. **Teste login existente**:
   - Faça logout
   - Faça login novamente
   - Nenhuma duplicação deve ocorrer
   - Dashboard deve mostrar empresa e role

**Arquivos criados na FASE 4 (Criação Automática):**
- `supabase/migrations/001_create_companies_and_profiles.sql` - Migração SQL
- `src/lib/profile.ts` - Funções de gerenciamento de perfil
- `src/app/page.tsx` - Ponto de entrada que garante criação automática
- `src/app/(dashboard)/dashboard/page.tsx` - Apenas consome dados existentes
- `src/lib/rbac/user.ts` - Lê role real do banco (FASE 5)

**Estrutura das Tabelas:**

```sql
-- companies
id (uuid, PK)
name (text)
owner_id (uuid, FK -> auth.users)
created_at (timestamp)

-- profiles
id (uuid, PK)
user_id (uuid, FK -> auth.users, UNIQUE)
company_id (uuid, FK -> companies)
role (text: 'admin' | 'user')
created_at (timestamp)
```

**Garantias do Sistema:**
- ✅ Todo usuário autenticado sempre tem uma company
- ✅ Todo usuário autenticado sempre tem um profile
- ✅ Criação automática no primeiro acesso autenticado (ponto de entrada)
- ✅ Idempotente: pode ser chamada múltiplas vezes sem duplicar
- ✅ Isolamento total via RLS
- ✅ Sem race conditions
- ✅ Sem dados mock ou fake

## ✅ Validação da FASE 5 (RBAC Real Integrado ao Banco)

Para validar que o RBAC real está funcionando:

### Pré-requisitos

1. **Execute a migração SQL** (se ainda não executou):
   - Execute `supabase/migrations/001_create_companies_and_profiles.sql` no Supabase
   - Isso cria as tabelas `companies` e `profiles` com RLS

2. **Registre um usuário**:
   - Acesse `/register` e crie uma conta
   - O sistema criará automaticamente company e profile com role 'user'

### Testes de Validação

1. **Teste com role 'user'**:
   - Acesse `/dashboard` - deve funcionar (role 'user' tem DASHBOARD_VIEW)
   - O dashboard deve exibir o role real do banco ('user')
   - Verifique no Supabase Table Editor que `profiles.role = 'user'`

2. **Teste com role 'admin'** (opcional):
   - No Supabase Table Editor, altere `profiles.role` para 'admin'
   - Recarregue o dashboard
   - O sistema deve usar o role 'admin' do banco
   - Role exibido deve ser 'admin'

3. **Teste de bloqueio** (sem profile):
   - Se um usuário não tiver profile, todas as verificações devem retornar false
   - `getUserRole()` retorna `null` se não existir profile
   - `checkPermission()` retorna `false` se role for `null`
   - `requirePermission()` lança erro se role for `null`

**Arquivos modificados na FASE 5:**
- `src/lib/rbac/user.ts` - Agora lê `profiles.role` do banco (sem fallback)
- `src/lib/rbac/check.ts` - Usa role real (comentários atualizados)
- `README.md` - Documentação consolidada

**O que mudou da FASE 4 para FASE 5:**

| Aspecto | FASE 4 | FASE 5 |
|---------|--------|--------|
| `getUserRole()` | Retorna role estático 'user' | Lê `profiles.role` do banco |
| Fallback | N/A (sempre 'user') | Nenhum fallback (null = bloqueado) |
| Validação | Não valida | Valida role antes de retornar |
| Dados | Estrutural (tipos/constantes) | Funcional (dados reais) |

**Garantias da FASE 5:**
- ✅ RBAC nunca cria dados (apenas consome `profiles.role`)
- ✅ `null` significa acesso BLOQUEADO (sem fallback)
- ✅ Todas as verificações usam role real do banco
- ✅ Validação explícita de role válido
- ✅ Permissões continuam sendo fonte única da verdade
- ✅ Tipagem forte em todos os retornos
- ✅ Separação de responsabilidades mantida

**Importante:**
- Usuários SEM profile NÃO possuem acesso (role = null)
- A criação de profile é responsabilidade do bootstrap (src/app/page.tsx)
- RBAC apenas consome dados, nunca cria

---

**Status**: FASE 5 concluída ✅ | Próxima fase: Dashboard Funcional
