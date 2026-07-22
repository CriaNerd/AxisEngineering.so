# Gestão Engenharia AXIS - Render + Localhost 3000

Versão preparada para rodar localmente em `http://localhost:3000` e fazer deploy no Render como **Web Service**.

## Rodar localmente

1. Extraia o ZIP.
2. Entre na pasta onde estão `package.json` e `server.js`.
3. Abra o CMD nessa pasta.
4. Rode:

```bash
npm install --no-audit --no-fund
npm start
```

Abra:

```text
http://localhost:3000
```

Sem `DATABASE_URL`, o sistema roda em memória temporária para teste local. Para produção, use PostgreSQL no Render.

## Deploy no Render

Crie como:

```text
New +
Web Service
```

Configuração manual:

```text
Build Command: npm install --no-audit --no-fund
Start Command: npm start
```

Variáveis obrigatórias no Render:

```env
APP_URL=https://seu-dominio.onrender.com
DATABASE_URL=URL_DO_POSTGRESQL_DO_RENDER
PGSSL=true
AXIS_ADMIN_EMAIL=seu-email-admin
AXIS_ADMIN_PASSWORD=sua-senha-forte
ADMIN_JWT_SECRET=uma-chave-grande-qualquer
```

Mercado Pago:

```env
MP_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxxxxxxxxxxxxxx
MP_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxxxxxxxxxxxxxx
```

Contato:

```env
AXIS_WHATSAPP=5521999999999
AXIS_CONTACT_EMAIL=contato@axissolutions.com.br
```

SMTP opcional:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=AXIS Solutions <contato@axissolutions.com.br>
```

## Admin Axis

Depois de subir:

```text
https://seu-dominio.onrender.com/axis-admin.html
```

Use `AXIS_ADMIN_EMAIL` e `AXIS_ADMIN_PASSWORD`.

## Webhook Mercado Pago

Configure no Mercado Pago Developers:

```text
https://seu-dominio.onrender.com/api/mercadopago/webhook
```

Eventos recomendados:

```text
payment
preapproval
subscription_preapproval
```

## Observação

O `package-lock.json` foi removido de propósito para evitar travamento no Windows com registry/cache antigo. O `npm install` vai gerar um lock novo na sua máquina ou no Render.


## V17 - Branding e editor visual
- Nome padrão: Gestão Engenharia AXIS.
- Logo premium SVG transparente em `public/assets/axis-logo-premium.svg`.
- Painel Admin > Aparência do site permite editar nome, cores, rodapé e logo.
- Variáveis Mercado Pago aceitas: `MP_ACCESS_TOKEN` ou `MERCADO_PAGO_ACCESS_TOKEN`.


## V18
- Melhoria de nitidez visual em textos, botões e logo.
- Mantida a estrutura do sistema e as funcionalidades existentes.


## V19
- Logo AXIS futurista aplicada no sistema em SVG com fundo transparente.
- Mantidas as funcionalidades de pagamento Mercado Pago, webhook, admin e editor de aparência.

### Webhook Mercado Pago
Use em produção:
`https://SEU-DOMINIO.onrender.com/api/mercadopago/webhook`

Eventos recomendados: Order, Pagamentos (legacy), Planos e assinaturas.


## V20
- Dashboard flutuante 3D restaurado via CSS.
- Nenhuma regra de pagamento, backend ou estrutura foi alterada.


## V20 final float restore
- Removida a regra que desativava `transform` e `animation` da `.system-showcase`.
- Restaurado o efeito flutuante original do dashboard.
- Nenhuma funcionalidade de pagamento, backend ou admin foi alterada.


## V20.1
- Corrigida a flutuação automática: agora o dashboard anima sozinho, sem depender do hover.

## V21
- Cancelamento de assinatura pelo assinante em Demo > Assinatura.
- Cancelamento de assinatura pelo admin no Painel de Assinantes.
- Rota de cancelamento tenta cancelar no Mercado Pago quando existe MP_ACCESS_TOKEN e subscriptionId.
- Botão flutuante de suporte para assinantes.
- Botão “Sistema Sob Medida” direcionando para WhatsApp 21966390331.
- Axis AI mantida liberada para Professional e Enterprise.
- Mensagens públicas removidas para não mencionar MP_ACCESS_TOKEN.
- Animação flutuante do quadro de demonstração restaurada no CSS.

## V22
- Removido botão flutuante de suporte do site público de vendas.
- WhatsApp público mantido apenas no botão “Sistema Sob Medida / Falar com a AXIS”.
- Suporte por WhatsApp mantido somente dentro do sistema/demo para assinantes.
- Mantidos cancelamento admin/assinante, Mercado Pago, PostgreSQL, Axis AI Professional/Enterprise e editor admin.

## V23 — Teste utilizável por 7 dias
- A demo agora permite cadastrar, editar e excluir clientes, obras, lançamentos financeiros, documentos e equipe.
- Os dados são salvos automaticamente no `localStorage` do navegador por 7 dias.
- O contador do período gratuito aparece no topo e na barra lateral.
- Após 7 dias, os dados permanecem visíveis, mas a edição é bloqueada e o usuário é direcionado aos planos.
- A IA e o suporte continuam fora do teste gratuito, respeitando a exclusividade dos assinantes.
- Observação: nesta versão, os dados do teste ficam no navegador utilizado. Não sincronizam entre computadores.

## V23.1 — Dados ocultos após o teste
- Durante os 7 dias gratuitos, o usuário pode utilizar normalmente e salvar informações.
- Após o término do período, os dados continuam armazenados no navegador.
- Os dados deixam de ficar visíveis e o sistema exibe uma tela bloqueada.
- A tela orienta o usuário a escolher um plano para recuperar o acesso.
- Nenhum dado é apagado automaticamente.

## V23.2 — Captação de leads do teste
- Ao iniciar o teste, o visitante informa nome do responsável, empresa, e-mail e WhatsApp.
- Os dados são salvos no PostgreSQL pelo endpoint `/api/trial-lead`.
- Incluído campo separado de autorização para contato comercial.
- O painel administrativo agora exibe os leads e permite exportar CSV.
- O consentimento é exibido no painel para separar quem autorizou ações de marketing.

## V24 — Gráficos animados na demo
- Adicionado gráfico animado de receita x despesas.
- Adicionado gráfico donut com status das obras.
- Adicionado funil comercial do CRM.
- Adicionado gráfico de barras de entradas e saídas.
- Adicionado painel de análise executiva da Axis Intelligence.
- KPIs agora possuem contadores animados.
- Os gráficos são feitos em HTML/CSS/SVG puro, sem biblioteca externa.
- Mantidas as funcionalidades do teste de 7 dias, captação de leads e armazenamento.

## Login administrativo seguro (v24.1)

A página administrativa fica em `/axis-admin.html`.

Em produção, configure no Render as variáveis:

- `AXIS_ADMIN_EMAIL`: e-mail administrativo.
- `AXIS_ADMIN_PASSWORD_HASH`: hash da senha (recomendado).
- `ADMIN_JWT_SECRET`: chave aleatória longa, com pelo menos 64 caracteres.
- Deixe `AXIS_ADMIN_PASSWORD` vazio quando usar o hash.

Para gerar o hash localmente:

```bash
node scripts/generate-admin-password-hash.js "SuaSenhaForteCom12OuMaisCaracteres"
```

Copie todo o resultado para `AXIS_ADMIN_PASSWORD_HASH`. Depois salve as variáveis no Render e faça um novo deploy/restart. Alterar a senha significa gerar outro hash e substituir a variável. Nunca coloque a senha real no GitHub, no código ou no arquivo `.env.example`.
