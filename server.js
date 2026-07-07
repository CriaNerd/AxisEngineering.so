require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_URL = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const AXIS_WHATSAPP = process.env.AXIS_WHATSAPP || '5521999999999';
const AXIS_CONTACT_EMAIL = process.env.AXIS_CONTACT_EMAIL || 'contato@axissolutions.com.br';
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || `AXIS <${AXIS_CONTACT_EMAIL}>`;
const DATABASE_URL = process.env.DATABASE_URL || '';
const AXIS_ADMIN_EMAIL = (process.env.AXIS_ADMIN_EMAIL || 'admin@axis.local').toLowerCase();
const AXIS_ADMIN_PASSWORD = process.env.AXIS_ADMIN_PASSWORD || 'Axis@123456';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || crypto.randomBytes(32).toString('hex');
const pool = DATABASE_URL ? new Pool({ connectionString: DATABASE_URL, ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false } }) : null;
let DB_CACHE = { companies: [], payments: [], subscriptions: [], passwordResets: [], proposals: [], contracts: [], events: [] };


const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 29.90,
    priceLabel: 'R$ 29,90',
    users: 'até 2 usuários',
    ai: false,
    highlight: false,
    features: ['CRM e clientes', 'Agenda e documentos', 'Financeiro básico', 'Fluxo de caixa', 'Dashboard executivo']
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 79.90,
    priceLabel: 'R$ 79,90',
    users: 'até 10 usuários',
    ai: true,
    highlight: true,
    features: ['Tudo do Starter', 'Axis AI Assistant', 'Propostas inteligentes', 'Envio de link de pagamento', 'Fechamento de contrato com cliente', 'Relatórios avançados']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.90,
    priceLabel: 'R$ 99,90',
    users: 'operação completa',
    ai: true,
    highlight: false,
    features: ['Tudo do Professional', 'Usuários ampliados', 'Permissões por equipe', 'Integrações', 'Suporte prioritário', 'Implantação guiada']
  },
  custom: {
    id: 'custom',
    name: 'Sistema Sob Medida',
    price: 0,
    priceLabel: 'Sob consulta',
    users: 'projeto personalizado',
    ai: true,
    highlight: false,
    features: ['Sistema exclusivo', 'Automações', 'Integrações com APIs', 'Dashboards personalizados', 'Consultoria Axis Solutions']
  }
};

function defaultSiteSettings(){ return {
  productName: 'Gestão Engenharia AXIS',
  shortName: 'AXIS',
  tagline: 'Sistema completo para gestão de engenharia',
  primaryColor: '#b91c1c',
  accentColor: '#c9972e',
  highlightColor: '#f1c96b',
  logo: '/assets/axis-logo-premium.svg',
  emblem: '/assets/axis-emblem-premium.svg',
  footerText: 'Gestão Engenharia AXIS © 2026 • Sistema desenvolvido pela AXIS'
}; }
function normalizeDB(db = {}) {
  db.siteSettings ||= defaultSiteSettings();
  db.companies ||= [];
  db.payments ||= [];
  db.subscriptions ||= [];
  db.passwordResets ||= [];
  db.proposals ||= [];
  db.contracts ||= [];
  db.events ||= [];
  return db;
}
function readDB() { return normalizeDB(DB_CACHE); }
async function persistDB(db) {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO axis_state (id, data, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      ['main', JSON.stringify(normalizeDB(db))]
    );
  } catch (e) {
    console.error('Erro ao salvar no PostgreSQL:', e.message);
  }
}
function writeDB(db) { DB_CACHE = normalizeDB(db); persistDB(DB_CACHE); }
async function initPostgres() {
  if (!pool) {
    console.warn('DATABASE_URL não configurado. Rodando em memória temporária. Configure PostgreSQL para produção.');
    return;
  }
  await pool.query(`CREATE TABLE IF NOT EXISTS axis_state (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const result = await pool.query('SELECT data FROM axis_state WHERE id=$1', ['main']);
  if (result.rows[0]?.data) {
    DB_CACHE = normalizeDB(result.rows[0].data);
  } else {
    await persistDB(DB_CACHE);
  }
  console.log('PostgreSQL conectado e sincronizado.');
}
function signAdminToken(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}
function verifyAdminToken(token = '') {
  const [body, sig] = String(token).split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', ADMIN_JWT_SECRET).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp < Date.now()) return null;
  return payload;
}
function requireAxisAdmin(req, res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const payload = verifyAdminToken(token);
  if (!payload || payload.role !== 'axis_admin') return res.status(401).json({ ok: false, error: 'Acesso administrativo inválido.' });
  req.axisAdmin = payload;
  next();
}
function clean(v, fallback = '') { return String(v || fallback).trim().slice(0, 180); }
function moneyToNumber(value) {
  const normalized = String(value || '0').replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 1;
}
function findOrCreateCompany(db, input = {}) {
  const email = clean(input.email).toLowerCase();
  let company = email ? db.companies.find(c => c.email === email) : null;
  if (!company) {
    company = {
      id: 'axis_' + Date.now(),
      name: clean(input.companyName, 'Minha Empresa de Engenharia'),
      admin: clean(input.adminName, 'Administrador'),
      email,
      plan: 'trial',
      status: 'trial',
      passwordHash: input.password ? hashPassword(input.password) : '',
      trialEndsAt: new Date(Date.now() + 7 * 864e5).toISOString(),
      createdAt: new Date().toISOString()
    };
    db.companies.push(company);
    db.events.push({ type: 'company.created', companyId: company.id, createdAt: new Date().toISOString() });
  }
  return company;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(String(password || ''), salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored = '') {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const candidate = hashPassword(password, salt).split(':')[1];
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(candidate));
}
async function sendEmail({ to, subject, html, text }) {
  const db = readDB();
  const event = { type: 'email.queued', to, subject, createdAt: new Date().toISOString() };
  try {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      db.events.push({ ...event, type: 'email.skipped', reason: 'SMTP não configurado', preview: text || html });
      writeDB(db);
      return { ok: true, skipped: true };
    }
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });
    await transporter.sendMail({ from: SMTP_FROM, to, subject, text, html });
    db.events.push({ ...event, type: 'email.sent' });
    writeDB(db);
    return { ok: true };
  } catch (e) {
    db.events.push({ ...event, type: 'email.failed', error: e.message });
    writeDB(db);
    return { ok: false, error: e.message };
  }
}
function planFromId(planId) {
  return PLANS[planId] || PLANS.professional;
}
async function mercadoPagoPreapproval(payload) {
  if (!MP_ACCESS_TOKEN) return null;
  const response = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || json.error || 'Erro ao criar assinatura no Mercado Pago');
  return json;
}
async function getMercadoPagoPreapproval(id) {
  if (!MP_ACCESS_TOKEN || !id) return null;
  const response = await fetch(`https://api.mercadopago.com/preapproval/${id}`, {
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || json.error || 'Erro ao consultar assinatura no Mercado Pago');
  return json;
}
function syncCompanySubscription(db, subscription) {
  const ref = subscription.external_reference || '';
  if (!ref.startsWith('subscription:')) return null;
  const [, companyId, planIdFromRef] = ref.split(':');
  const company = db.companies.find(c => c.id === companyId);
  if (!company) return null;
  const status = String(subscription.status || '').toLowerCase();
  const planId = planIdFromRef || company.planIntent || company.plan || 'professional';
  company.subscriptionId = subscription.id || company.subscriptionId;
  company.subscriptionStatus = status;
  company.plan = planId;
  company.lastWebhookAt = new Date().toISOString();
  if (['authorized', 'active'].includes(status)) {
    company.status = 'active';
    company.activatedAt ||= new Date().toISOString();
  } else if (['paused', 'cancelled', 'cancelled_by_collector', 'cancelled_by_user', 'finished'].includes(status)) {
    company.status = 'inactive';
    company.deactivatedAt = new Date().toISOString();
  } else if (['pending'].includes(status)) {
    company.status = 'pending_subscription';
  }
  let sub = db.subscriptions.find(s => s.id === subscription.id);
  if (!sub) {
    sub = { id: subscription.id, companyId, createdAt: new Date().toISOString() };
    db.subscriptions.push(sub);
  }
  Object.assign(sub, {
    companyId,
    plan: planId,
    status,
    external_reference: ref,
    payer_email: subscription.payer_email,
    init_point: subscription.init_point,
    updatedAt: new Date().toISOString()
  });
  return company;
}

async function mercadoPagoPreference(payload) {
  if (!MP_ACCESS_TOKEN) {
    return null;
  }
  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.message || json.error || 'Erro ao criar checkout no Mercado Pago');
  }
  return json;
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => res.json({ ok: true, product: 'Gestão Engenharia AXIS', gateway: 'Mercado Pago', plans: PLANS }));
app.get('/api/plans', (req, res) => res.json({ ok: true, currency: 'BRL', plans: Object.values(PLANS) }));

app.post('/api/register-company', async (req, res) => {
  const db = readDB();
  const company = findOrCreateCompany(db, req.body || {});
  writeDB(db);
  if (company.email) {
    await sendEmail({
      to: company.email,
      subject: 'Bem-vindo ao Gestão Engenharia AXIS',
      text: `Olá ${company.admin}, sua empresa ${company.name} foi criada no Gestão Engenharia AXIS. Acesse ${APP_URL}/pricing.html para escolher seu plano.`,
      html: `<h2>Bem-vindo ao Gestão Engenharia AXIS</h2><p>Olá ${company.admin}, sua empresa <b>${company.name}</b> foi criada com sucesso.</p><p>Escolha seu plano para ativar o sistema: <a href="${APP_URL}/pricing.html">ver planos</a>.</p>`
    });
  }
  res.json({ ok: true, company });
});

app.post('/api/auth/login', (req, res) => {
  const db = readDB();
  const email = clean(req.body.email).toLowerCase();
  const password = String(req.body.password || '');
  const company = db.companies.find(c => c.email === email);
  if (!company || !company.passwordHash || !verifyPassword(password, company.passwordHash)) {
    return res.status(401).json({ ok: false, error: 'E-mail ou senha inválidos.' });
  }
  res.json({ ok: true, company: { id: company.id, name: company.name, admin: company.admin, email: company.email, plan: company.plan, status: company.status } });
});

app.post('/api/auth/request-password-reset', async (req, res) => {
  const db = readDB();
  const email = clean(req.body.email).toLowerCase();
  const company = db.companies.find(c => c.email === email);
  if (company) {
    const token = crypto.randomBytes(32).toString('hex');
    db.passwordResets = db.passwordResets.filter(r => r.companyId !== company.id && new Date(r.expiresAt) > new Date());
    db.passwordResets.push({ token, companyId: company.id, email, used: false, expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), createdAt: new Date().toISOString() });
    writeDB(db);
    const link = `${APP_URL}/reset-password.html?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Recuperação de senha Gestão Engenharia AXIS',
      text: `Use este link para redefinir sua senha: ${link}`,
      html: `<h2>Recuperação de senha</h2><p>Clique no link abaixo para redefinir sua senha. Ele expira em 1 hora.</p><p><a href="${link}">Redefinir senha</a></p>`
    });
  } else {
    writeDB(db);
  }
  res.json({ ok: true, message: 'Se o e-mail existir, enviaremos um link de recuperação.' });
});

app.post('/api/auth/reset-password', (req, res) => {
  const db = readDB();
  const token = clean(req.body.token);
  const password = String(req.body.password || '');
  if (password.length < 6) return res.status(400).json({ ok: false, error: 'A senha precisa ter pelo menos 6 caracteres.' });
  const reset = db.passwordResets.find(r => r.token === token && !r.used && new Date(r.expiresAt) > new Date());
  if (!reset) return res.status(400).json({ ok: false, error: 'Token inválido ou expirado.' });
  const company = db.companies.find(c => c.id === reset.companyId);
  if (!company) return res.status(404).json({ ok: false, error: 'Empresa não encontrada.' });
  company.passwordHash = hashPassword(password);
  reset.used = true;
  reset.usedAt = new Date().toISOString();
  db.events.push({ type: 'password.reset', companyId: company.id, createdAt: new Date().toISOString() });
  writeDB(db);
  res.json({ ok: true, message: 'Senha redefinida com sucesso.' });
});

app.post('/api/create-subscription-checkout', async (req, res) => {
  try {
    const plan = planFromId(req.body?.plan || 'professional');
    if (plan.id === 'custom') {
      const text = encodeURIComponent('Olá, quero falar com a AXIS sobre um sistema sob medida para minha empresa.');
      return res.json({ ok: true, url: `https://wa.me/${AXIS_WHATSAPP}?text=${text}` });
    }
    const db = readDB();
    const company = findOrCreateCompany(db, req.body || {});
    if (!company.email) return res.status(400).json({ ok: false, error: 'Informe o e-mail de cobrança para criar a assinatura.' });
    company.planIntent = plan.id;
    company.status = company.status === 'active' ? 'active' : 'pending_subscription';
    writeDB(db);

    const externalReference = `subscription:${company.id}:${plan.id}`;
    const preapprovalPayload = {
      reason: `Gestão Engenharia AXIS - Plano ${plan.name}`,
      external_reference: externalReference,
      payer_email: company.email,
      back_url: `${APP_URL}/success.html?type=subscription&plan=${plan.id}`,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: plan.price,
        currency_id: 'BRL'
      },
      status: 'pending'
    };

    const preapproval = await mercadoPagoPreapproval(preapprovalPayload);
    if (!preapproval) {
      return res.json({ ok: true, demo: true, url: `/success.html?mode=simulado&type=subscription&plan=${plan.id}`, message: 'Modo simulado: configure MP_ACCESS_TOKEN para criar assinatura real Mercado Pago.' });
    }

    const db2 = readDB();
    const company2 = db2.companies.find(c => c.id === company.id);
    if (company2) {
      company2.subscriptionId = preapproval.id;
      company2.subscriptionStatus = preapproval.status || 'pending';
      company2.planIntent = plan.id;
      company2.status = 'pending_subscription';
    }
    db2.subscriptions.push({
      id: preapproval.id,
      companyId: company.id,
      plan: plan.id,
      status: preapproval.status || 'pending',
      external_reference: externalReference,
      init_point: preapproval.init_point,
      createdAt: new Date().toISOString()
    });
    db2.events.push({ type: 'subscription.checkout_created', companyId: company.id, plan: plan.id, subscriptionId: preapproval.id, createdAt: new Date().toISOString() });
    writeDB(db2);

    res.json({ ok: true, gateway: 'mercadopago', kind: 'subscription', url: preapproval.init_point, subscriptionId: preapproval.id });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/create-proposal-payment-link', async (req, res) => {
  try {
    const db = readDB();
    const proposal = {
      id: 'prop_' + Date.now(),
      companyName: clean(req.body.companyName, 'Axis Demo Engenharia'),
      clientName: clean(req.body.clientName, 'Cliente'),
      clientEmail: clean(req.body.clientEmail).toLowerCase(),
      title: clean(req.body.title, 'Proposta de engenharia'),
      description: clean(req.body.description, 'Serviços de engenharia conforme proposta aprovada.'),
      amount: moneyToNumber(req.body.amount || 1000),
      currency: 'BRL',
      status: 'created',
      contractStatus: 'proposal_sent',
      createdAt: new Date().toISOString()
    };
    db.proposals.push(proposal);
    db.contracts.push({ id: 'contract_' + Date.now(), proposalId: proposal.id, clientName: proposal.clientName, status: 'awaiting_payment', amount: proposal.amount, createdAt: new Date().toISOString() });
    db.events.push({ type: 'proposal.created', proposalId: proposal.id, createdAt: new Date().toISOString() });
    writeDB(db);

    const preferencePayload = {
      external_reference: `proposal:${proposal.id}`,
      notification_url: `${APP_URL}/api/mercadopago/webhook`,
      back_urls: {
        success: `${APP_URL}/success.html?type=proposal&proposal=${proposal.id}`,
        failure: `${APP_URL}/demo.html?proposal_status=failure`,
        pending: `${APP_URL}/demo.html?proposal_status=pending`
      },
      auto_return: 'approved',
      metadata: { product: 'Gestão Engenharia AXIS', kind: 'proposal', proposalId: proposal.id, companyName: proposal.companyName, clientName: proposal.clientName },
      payer: { email: proposal.clientEmail || undefined, name: proposal.clientName || undefined },
      items: [{
        id: proposal.id,
        title: proposal.title,
        description: `${proposal.companyName} • ${proposal.description}`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: proposal.amount
      }]
    };

    const preference = await mercadoPagoPreference(preferencePayload);
    if (!preference) {
      const simulated = `${APP_URL}/success.html?type=proposal&mode=simulado&proposal=${proposal.id}`;
      return res.json({ ok: true, demo: true, proposal, url: simulated, message: 'Link simulado. Configure MP_ACCESS_TOKEN para gerar link real no Mercado Pago.' });
    }

    proposal.mercadoPagoPreferenceId = preference.id;
    proposal.paymentUrl = preference.init_point;
    proposal.status = 'payment_link_created';
    const db2 = readDB();
    const p = db2.proposals.find(x => x.id === proposal.id); if (p) Object.assign(p, proposal);
    db2.events.push({ type: 'proposal.payment_link_created', proposalId: proposal.id, preferenceId: preference.id, createdAt: new Date().toISOString() });
    writeDB(db2);
    res.json({ ok: true, gateway: 'mercadopago', proposal, url: preference.init_point, sandbox_url: preference.sandbox_init_point, preferenceId: preference.id });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

app.post('/api/axis-ai', (req, res) => {
  const plan = clean(req.body.plan || 'professional').toLowerCase();
  const message = clean(req.body.message || '').toLowerCase();
  if (plan === 'starter') {
    return res.json({ ok: true, locked: true, answer: 'A Axis AI está disponível a partir do plano Professional. Ela ajuda a criar propostas, gerar links de pagamento, organizar contratos, resumir obras e orientar o uso do sistema.' });
  }
  let answer = 'Posso ajudar você a usar o Gestão Engenharia AXIS. Escolha uma ação: criar proposta, gerar link de pagamento, organizar documentos, revisar fluxo de caixa, acompanhar obras ou preparar relatório.';
  if (message.includes('proposta') || message.includes('contrato')) answer = 'Para fechar contrato, acesse Propostas & Pagamentos, preencha cliente, descrição e valor. O sistema gera a proposta e o link Mercado Pago para enviar por WhatsApp ou e-mail.';
  if (message.includes('pagamento') || message.includes('pix')) answer = 'O pagamento integrado usa Mercado Pago. Com o MP_ACCESS_TOKEN no Render, o sistema cria o checkout automaticamente com PIX, cartão e boleto quando disponíveis na sua conta.';
  if (message.includes('cliente') || message.includes('crm')) answer = 'No CRM, mova o cliente entre Novo Lead, Proposta Enviada, Pagamento Pendente e Fechado. Isso deixa claro quem precisa de follow-up para fechar obra.';
  if (message.includes('financeiro') || message.includes('caixa')) answer = 'No Financeiro e Fluxo de Caixa, acompanhe valores a receber, despesas, saldo mensal e pagamentos de contratos fechados.';
  if (message.includes('documento')) answer = 'Em Documentos, organize contratos, medições, notas fiscais, imagens da obra e arquivos técnicos por cliente e por obra.';
  res.json({ ok: true, answer });
});

app.post('/api/mercadopago/webhook', async (req, res) => {
  try {
    const db = readDB();
    const body = req.body || {};
    db.events.push({ type: 'mercadopago.webhook.received', body, createdAt: new Date().toISOString() });

    const topic = String(body.type || body.topic || body.action || '').toLowerCase();
    const id = body?.data?.id || body?.id || body?.resource;

    if (MP_ACCESS_TOKEN && id && (topic.includes('preapproval') || topic.includes('subscription'))) {
      try {
        const subscription = await getMercadoPagoPreapproval(id);
        const company = syncCompanySubscription(db, subscription);
        db.events.push({ type: 'subscription.synced', subscriptionId: subscription.id, status: subscription.status, companyId: company?.id, createdAt: new Date().toISOString() });
        if (company && company.status === 'active' && company.email) {
          await sendEmail({
            to: company.email,
            subject: 'Plano AXIS ativado com sucesso',
            text: `Olá ${company.admin}, seu plano ${planFromId(company.plan).name} foi ativado. Acesse ${APP_URL}/demo.html para usar o sistema.`,
            html: `<h2>Plano ativado</h2><p>Olá ${company.admin}, seu plano <b>${planFromId(company.plan).name}</b> foi ativado com sucesso.</p><p><a href="${APP_URL}/demo.html">Acessar sistema</a></p>`
          });
        }
      } catch (e) {
        db.events.push({ type: 'subscription.sync_failed', id, error: e.message, createdAt: new Date().toISOString() });
      }
    }

    const paymentId = body?.data?.id || body?.id;
    if (MP_ACCESS_TOKEN && paymentId && topic.includes('payment')) {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } });
      const payment = await response.json();
      const ref = payment.external_reference || '';
      db.payments.push({ id: String(paymentId), status: payment.status, amount: payment.transaction_amount, payment_method: payment.payment_method_id, external_reference: ref, createdAt: new Date().toISOString() });
      if (payment.status === 'approved') {
        if (ref.startsWith('subscription:')) {
          const [, companyId, planId] = ref.split(':');
          const company = db.companies.find(c => c.id === companyId);
          if (company) {
            company.status = 'active';
            company.plan = planId || company.planIntent || 'professional';
            company.activatedAt = new Date().toISOString();
          }
        }
        if (ref.startsWith('proposal:')) {
          const [, proposalId] = ref.split(':');
          const proposal = db.proposals.find(p => p.id === proposalId);
          if (proposal) { proposal.status = 'paid'; proposal.contractStatus = 'contract_closed'; proposal.paidAt = new Date().toISOString(); }
          const contract = db.contracts.find(c => c.proposalId === proposalId);
          if (contract) { contract.status = 'contract_closed'; contract.closedAt = new Date().toISOString(); }
        }
      }
    }
    writeDB(db);
    res.sendStatus(200);
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});



app.get('/api/site-settings', (req, res) => {
  const db = readDB();
  res.json({ ok: true, settings: { ...defaultSiteSettings(), ...(db.siteSettings || {}) } });
});

app.get('/api/axis-admin/site-settings', requireAxisAdmin, (req, res) => {
  const db = readDB();
  res.json({ ok: true, settings: { ...defaultSiteSettings(), ...(db.siteSettings || {}) } });
});

app.post('/api/axis-admin/site-settings', requireAxisAdmin, (req, res) => {
  const db = readDB();
  const current = { ...defaultSiteSettings(), ...(db.siteSettings || {}) };
  const next = {
    ...current,
    productName: clean(req.body.productName, current.productName),
    shortName: clean(req.body.shortName, current.shortName),
    tagline: clean(req.body.tagline, current.tagline),
    primaryColor: clean(req.body.primaryColor, current.primaryColor),
    accentColor: clean(req.body.accentColor, current.accentColor),
    highlightColor: clean(req.body.highlightColor, current.highlightColor),
    footerText: clean(req.body.footerText, current.footerText)
  };
  if (String(req.body.logo || '').startsWith('data:image/') || String(req.body.logo || '').startsWith('/assets/')) next.logo = req.body.logo;
  if (String(req.body.emblem || '').startsWith('data:image/') || String(req.body.emblem || '').startsWith('/assets/')) next.emblem = req.body.emblem;
  db.siteSettings = next;
  db.events.push({ type: 'axis_admin.site_settings_updated', createdAt: new Date().toISOString() });
  writeDB(db);
  res.json({ ok: true, settings: next });
});

app.post('/api/axis-admin/login', (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const password = String(req.body.password || '');
  if (email !== AXIS_ADMIN_EMAIL || password !== AXIS_ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Login administrativo inválido.' });
  }
  const token = signAdminToken({ email, role: 'axis_admin' });
  res.json({ ok: true, token, admin: { email, role: 'axis_admin' } });
});

app.get('/api/axis-admin/subscribers', requireAxisAdmin, (req, res) => {
  const db = readDB();
  const subscribers = db.companies.map(c => {
    const plan = PLANS[c.plan] || PLANS[c.planIntent] || { name: c.plan || 'Sem plano', price: 0 };
    const subscription = db.subscriptions.find(s => s.companyId === c.id || s.id === c.subscriptionId);
    return {
      id: c.id,
      company: c.name,
      admin: c.admin,
      email: c.email,
      plan: c.plan,
      planName: plan.name,
      status: c.status,
      subscriptionStatus: c.subscriptionStatus || subscription?.status || '',
      subscriptionId: c.subscriptionId || subscription?.id || '',
      monthlyValue: plan.price || 0,
      trialEndsAt: c.trialEndsAt,
      createdAt: c.createdAt,
      activatedAt: c.activatedAt,
      lastWebhookAt: c.lastWebhookAt
    };
  }).sort((a,b) => String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  const mrr = subscribers.reduce((sum, s) => sum + (s.status === 'active' ? Number(s.monthlyValue || 0) : 0), 0);
  res.json({
    ok: true,
    summary: {
      total: subscribers.length,
      active: subscribers.filter(s => s.status === 'active').length,
      pending: subscribers.filter(s => s.status === 'pending_subscription').length,
      trial: subscribers.filter(s => s.status === 'trial').length,
      inactive: subscribers.filter(s => s.status === 'inactive').length,
      mrr
    },
    subscribers,
    events: db.events.slice(-80).reverse()
  });
});

app.post('/api/axis-admin/subscribers/:id/status', requireAxisAdmin, (req, res) => {
  const db = readDB();
  const company = db.companies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ ok: false, error: 'Assinante não encontrado.' });
  const status = clean(req.body.status || company.status);
  const plan = clean(req.body.plan || company.plan || 'professional');
  company.status = status;
  company.plan = plan;
  company.adminUpdatedAt = new Date().toISOString();
  db.events.push({ type: 'axis_admin.subscriber_updated', companyId: company.id, status, plan, createdAt: new Date().toISOString() });
  writeDB(db);
  res.json({ ok: true, company });
});

app.get('/api/admin-summary', (req, res) => {
  const db = readDB();
  const active = db.companies.filter(c => c.status === 'active').length;
  const trial = db.companies.filter(c => c.status === 'trial').length;
  const mrr = db.companies.reduce((sum, c) => sum + (c.status === 'active' ? (PLANS[c.plan]?.price || 0) : 0), 0);
  res.json({ companies: db.companies.length, active, trial, mrr: `R$ ${mrr.toFixed(2).replace('.', ',')}/mês`, proposals: db.proposals.length, contracts: db.contracts.length, payments: db.payments.length, events: db.events.slice(-30).reverse() });
});

initPostgres().then(() => {
  app.listen(PORT, () => console.log(`Gestão Engenharia AXIS rodando em ${APP_URL}`));
}).catch((e) => {
  console.error('Falha ao inicializar PostgreSQL:', e);
  process.exit(1);
});
