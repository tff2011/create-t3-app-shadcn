# 🟢 MATRIX BITCOIN - Sistema de Autenticação

Uma página de login estilo Matrix com tema Bitcoin, construída com Next.js, TypeScript e shadcn/ui.

## ✨ Características

- **Design Matrix**: Interface inspirada no filme Matrix com caracteres caindo
- **Tema Bitcoin**: Cores e elementos relacionados ao Bitcoin
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Seguro**: Autenticação baseada em variáveis de ambiente
- **Dashboard**: Painel completo após o login com estatísticas Bitcoin

## 🚀 Como Usar

### 1. Credenciais de Login
As credenciais padrão estão definidas no arquivo `src/env.js`:
- **Usuário**: `satoshi`
- **Senha**: `nakamoto2009`

### 2. Executar o Projeto
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

### 3. Acessar
Abra seu navegador e acesse: `http://localhost:3000`

## 🎨 Componentes

### MatrixLogin
- Formulário de autenticação estilo Matrix
- Caracteres japoneses e números caindo
- Validação de credenciais
- Animações e efeitos visuais

### Dashboard
- Preço do Bitcoin em tempo real
- Saldo da carteira
- Status da rede
- Transações recentes
- Estatísticas de mineração

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Credenciais de Login
LOGIN_USERNAME=satoshi
LOGIN_PASSWORD=nakamoto2009

# Configurações do Banco de Dados
DATABASE_URL="file:./db.sqlite"

# NextAuth (opcional)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Discord OAuth (opcional)
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

## 🛠️ Tecnologias Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos
- **Prisma** - ORM para banco de dados
- **NextAuth.js** - Autenticação (opcional)

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- Desktop (1920x1080+)
- Tablet (768px+)
- Mobile (320px+)

## 🎯 Funcionalidades

- ✅ Autenticação segura
- ✅ Interface Matrix/Bitcoin
- ✅ Dashboard responsivo
- ✅ Animações fluidas
- ✅ Validação de formulários
- ✅ Tratamento de erros
- ✅ Componentes reutilizáveis

## 🔒 Segurança

- Credenciais armazenadas em variáveis de ambiente
- Validação de entrada do usuário
- Proteção contra ataques básicos
- Sessões seguras

## 🚀 Deploy

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=out
```

## 📝 Licença

Este projeto é open source e está disponível sob a licença MIT.

---

**Desenvolvido com ❤️ usando T3 Stack + shadcn/ui**
