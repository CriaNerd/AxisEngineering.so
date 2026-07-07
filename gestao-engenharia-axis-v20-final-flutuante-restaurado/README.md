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
