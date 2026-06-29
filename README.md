# AXIS Engineering OS - Render + Localhost 3000

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
