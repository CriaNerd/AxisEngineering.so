(() => {
  "use strict";

  const TRIAL_KEY = "axis_trial_v23";
  const TRIAL_DAYS = 7;
  const DAY_MS = 24 * 60 * 60 * 1000;

  const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);

  const money = value => Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  const today = () => new Date().toISOString().slice(0, 10);

  function initialState() {
    const now = Date.now();
    return {
      version: 23,
      startedAt: now,
      expiresAt: now + TRIAL_DAYS * DAY_MS,
      company: {
        name: "Minha Empresa de Engenharia",
        responsible: "",
        email: "",
        phone: ""
      },
      clients: [],
      works: [],
      finance: [],
      documents: [],
      team: []
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(TRIAL_KEY));
      if (!saved || !saved.startedAt || !saved.expiresAt) return initialState();
      return {
        ...initialState(),
        ...saved,
        company: { ...initialState().company, ...(saved.company || {}) },
        clients: Array.isArray(saved.clients) ? saved.clients : [],
        works: Array.isArray(saved.works) ? saved.works : [],
        finance: Array.isArray(saved.finance) ? saved.finance : [],
        documents: Array.isArray(saved.documents) ? saved.documents : [],
        team: Array.isArray(saved.team) ? saved.team : []
      };
    } catch {
      return initialState();
    }
  }

  let state = loadState();
  let currentPage = "dashboard";

  function saveState() {
    localStorage.setItem(TRIAL_KEY, JSON.stringify(state));
    updateTrialHeader();
  }

  function isExpired() {
    return Date.now() >= Number(state.expiresAt);
  }

  function timeLeft() {
    const remaining = Math.max(0, Number(state.expiresAt) - Date.now());
    const days = Math.floor(remaining / DAY_MS);
    const hours = Math.floor((remaining % DAY_MS) / (60 * 60 * 1000));
    return { remaining, days, hours };
  }

  function ensureActive() {
    if (!isExpired()) return true;
    showExpired();
    return false;
  }

  function updateTrialHeader() {
    const { days, hours } = timeLeft();
    const badge = document.getElementById("trialBadge");
    const notice = document.getElementById("trialNotice");
    const side = document.getElementById("trialSideText");
    const companyName = document.getElementById("trialCompanyName");

    companyName.textContent = state.company.name || "Minha Empresa de Engenharia";

    if (isExpired()) {
      badge.textContent = "Teste gratuito encerrado";
      notice.innerHTML = `<b>Seu período de teste de 7 dias terminou.</b>
        Seus dados continuam salvos com segurança neste navegador, mas ficam ocultos até a ativação de um plano.
        <a href="pricing.html">Escolha um plano para recuperar o acesso.</a>`;
      notice.className = "trial-notice expired";
      side.textContent = "O teste terminou. Escolha um plano para continuar.";
      return;
    }

    badge.textContent = days > 0
      ? `Teste gratuito • ${days} dia${days === 1 ? "" : "s"} e ${hours}h restantes`
      : `Teste gratuito • ${hours}h restantes`;

    notice.innerHTML = `<b>Ambiente utilizável por 7 dias.</b>
      Cadastre clientes, obras, lançamentos, documentos e equipe.
      Os dados ficam salvos automaticamente neste navegador.`;
    notice.className = "trial-notice";
    side.textContent = `Dados salvos automaticamente. Restam ${days} dia${days === 1 ? "" : "s"} e ${hours}h.`;
  }

  function modal(content) {
    document.getElementById("trialModalContent").innerHTML = content;
    document.getElementById("trialModal").classList.remove("hidden");
  }

  function closeModal() {
    document.getElementById("trialModal").classList.add("hidden");
  }

  function showExpired() {
    modal(`
      <span class="badge">Teste encerrado</span>
      <h2>Seus 7 dias gratuitos terminaram</h2>
      <p>Os dados cadastrados continuam salvos neste navegador, porém permanecem ocultos até a ativação de um plano.</p>
      <a class="btn primary full" href="pricing.html">Ver planos</a>
    `);
  }

  function field(label, name, value = "", type = "text", required = false) {
    return `<label class="trial-field">
      <span>${esc(label)}</span>
      <input name="${esc(name)}" type="${esc(type)}" value="${esc(value)}" ${required ? "required" : ""}>
    </label>`;
  }

  function selectField(label, name, options, selected = "") {
    return `<label class="trial-field">
      <span>${esc(label)}</span>
      <select name="${esc(name)}">
        ${options.map(option => `<option ${option === selected ? "selected" : ""}>${esc(option)}</option>`).join("")}
      </select>
    </label>`;
  }

  function empty(message) {
    return `<div class="trial-empty">${esc(message)}</div>`;
  }

  function clientName(clientId) {
    return state.clients.find(client => client.id === clientId)?.name || "Sem cliente";
  }

  function dashboardPage() {
    const activeWorks = state.works.filter(work => work.status !== "Finalizada").length;
    const receivables = state.finance
      .filter(item => item.type === "Entrada" && item.status !== "Pago")
      .reduce((sum, item) => sum + Number(item.value || 0), 0);
    const paid = state.finance
      .filter(item => item.type === "Entrada" && item.status === "Pago")
      .reduce((sum, item) => sum + Number(item.value || 0), 0);

    const recentClients = state.clients.slice(-5).reverse();

    return `
      <div class="kpis">
        <article><small>Clientes cadastrados</small><b data-counter="${state.clients.length}">0</b><em>período de teste</em></article>
        <article><small>Obras em andamento</small><b data-counter="${activeWorks}">0</b><em>${state.works.length} obras cadastradas</em></article>
        <article><small>A receber</small><b data-money-counter="${receivables}">R$ 0</b><em>lançamentos pendentes</em></article>
        <article><small>Recebido</small><b data-money-counter="${paid}">R$ 0</b><em>entradas confirmadas</em></article>
      </div>

      <div class="demo-chart-grid">
        <article class="panel demo-chart-card demo-chart-wide">
          <div class="demo-chart-head">
            <div>
              <span class="badge">Indicadores financeiros</span>
              <h3>Receita x despesas</h3>
              <p>Evolução mensal simulada para demonstração do dashboard.</p>
            </div>
            <div class="demo-chart-legend">
              <span><i class="legend-dot revenue"></i>Receita</span>
              <span><i class="legend-dot expense"></i>Despesa</span>
            </div>
          </div>
          <div class="demo-line-chart" aria-label="Gráfico de receita e despesas">
            <svg viewBox="0 0 760 280" role="img">
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="currentColor" stop-opacity=".28"/>
                  <stop offset="100%" stop-color="currentColor" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <g class="chart-grid-lines">
                <line x1="52" y1="36" x2="730" y2="36"/>
                <line x1="52" y1="90" x2="730" y2="90"/>
                <line x1="52" y1="144" x2="730" y2="144"/>
                <line x1="52" y1="198" x2="730" y2="198"/>
                <line x1="52" y1="252" x2="730" y2="252"/>
              </g>
              <path class="chart-area" d="M52,226 C120,212 140,178 200,184 C260,190 292,142 350,154 C410,166 448,102 510,118 C572,134 622,72 680,84 C704,88 718,74 730,64 L730,252 L52,252 Z"/>
              <path class="chart-line revenue-line" d="M52,226 C120,212 140,178 200,184 C260,190 292,142 350,154 C410,166 448,102 510,118 C572,134 622,72 680,84 C704,88 718,74 730,64"/>
              <path class="chart-line expense-line" d="M52,238 C118,224 146,214 204,218 C264,222 298,188 356,198 C414,208 452,178 510,184 C570,190 620,150 680,156 C704,158 718,146 730,142"/>
              <g class="chart-labels">
                <text x="52" y="272">Jan</text><text x="160" y="272">Fev</text><text x="270" y="272">Mar</text>
                <text x="380" y="272">Abr</text><text x="490" y="272">Mai</text><text x="600" y="272">Jun</text><text x="710" y="272">Jul</text>
              </g>
            </svg>
          </div>
        </article>

        <article class="panel demo-chart-card">
          <div class="demo-chart-head">
            <div>
              <span class="badge">Obras</span>
              <h3>Status dos projetos</h3>
            </div>
          </div>
          <div class="demo-donut-wrap">
            <div class="demo-donut" style="--completed:42;--progress:38;">
              <div><b>15</b><span>obras</span></div>
            </div>
            <div class="demo-donut-legend">
              <span><i class="legend-dot completed"></i>Concluídas <b>42%</b></span>
              <span><i class="legend-dot progress"></i>Em andamento <b>38%</b></span>
              <span><i class="legend-dot planning"></i>Planejamento <b>20%</b></span>
            </div>
          </div>
        </article>

        <article class="panel demo-chart-card">
          <div class="demo-chart-head">
            <div>
              <span class="badge">CRM</span>
              <h3>Funil comercial</h3>
            </div>
          </div>
          <div class="demo-funnel-chart">
            <div style="--w:100%"><span>Novos leads</span><b>48</b></div>
            <div style="--w:82%"><span>Contato realizado</span><b>39</b></div>
            <div style="--w:61%"><span>Propostas</span><b>29</b></div>
            <div style="--w:42%"><span>Negociação</span><b>20</b></div>
            <div style="--w:27%"><span>Fechados</span><b>13</b></div>
          </div>
        </article>

        <article class="panel demo-chart-card demo-chart-wide">
          <div class="demo-chart-head">
            <div>
              <span class="badge">Fluxo de caixa</span>
              <h3>Entradas e saídas por mês</h3>
              <p>Comparativo financeiro com barras animadas.</p>
            </div>
          </div>
          <div class="demo-bar-chart" aria-label="Gráfico de barras de entradas e saídas">
            ${[
              ["Jan",62,36],["Fev",74,42],["Mar",58,31],["Abr",88,49],["Mai",79,44],["Jun",96,53]
            ].map(([month, incoming, outgoing], index) => `
              <div class="bar-group">
                <div class="bars">
                  <i class="bar incoming" style="--bar:${incoming}%;--delay:${index * 90}ms"></i>
                  <i class="bar outgoing" style="--bar:${outgoing}%;--delay:${index * 90 + 45}ms"></i>
                </div>
                <span>${month}</span>
              </div>`).join("")}
          </div>
          <div class="demo-chart-legend demo-bar-legend">
            <span><i class="legend-dot incoming"></i>Entradas</span>
            <span><i class="legend-dot outgoing"></i>Saídas</span>
          </div>
        </article>

        <article class="panel demo-chart-card">
          <div class="demo-chart-head">
            <div>
              <span class="badge">Axis Intelligence</span>
              <h3>Análise executiva</h3>
            </div>
          </div>
          <div class="demo-ai-insight">
            <div class="ai-scan-line"></div>
            <p>Receita prevista apresenta tendência positiva.</p>
            <strong>+18,4%</strong>
            <span>Comparado ao ciclo anterior</span>
            <ul>
              <li>5 propostas próximas do fechamento</li>
              <li>3 obras com margem acima da meta</li>
              <li>Fluxo de caixa saudável</li>
            </ul>
          </div>
        </article>
      </div>

      <div class="dashboard-grid">
        <div class="panel wide">
          <div class="trial-section-head">
            <div><h3>Clientes recentes</h3><p>Dados cadastrados durante o teste.</p></div>
            <button class="btn primary" data-action="new-client">Novo cliente</button>
          </div>
          ${recentClients.length ? `
            <table class="trial-table">
              <thead><tr><th>Cliente</th><th>Status</th><th>Serviço</th><th>Contato</th></tr></thead>
              <tbody>${recentClients.map(client => `
                <tr>
                  <td><b>${esc(client.name)}</b></td>
                  <td><mark>${esc(client.status)}</mark></td>
                  <td>${esc(client.service || "-")}</td>
                  <td>${esc(client.phone || client.email || "-")}</td>
                </tr>`).join("")}
              </tbody>
            </table>` : empty("Nenhum cliente cadastrado. Use o botão “Novo cliente” para testar o CRM.")}
        </div>
        <div class="panel">
          <h3>Armazenamento do teste</h3>
          <p>As informações são salvas automaticamente no navegador atual durante 7 dias.</p>
          <div class="cash">
            <span>Clientes <b>${state.clients.length}</b></span>
            <span>Obras <b>${state.works.length}</b></span>
            <span>Documentos <b>${state.documents.length}</b></span>
          </div>
        </div>
      </div>`;
  }

  function crmPage() {
    return `
      <div class="panel">
        <div class="trial-section-head">
          <div><h3>CRM de clientes</h3><p>Cadastre, edite e acompanhe o estágio de cada negociação.</p></div>
          <button class="btn primary" data-action="new-client">Novo cliente</button>
        </div>
        ${state.clients.length ? `
          <table class="trial-table">
            <thead><tr><th>Cliente</th><th>Contato</th><th>Serviço</th><th>Status</th><th>Valor</th><th>Ações</th></tr></thead>
            <tbody>${state.clients.map(client => `
              <tr>
                <td><b>${esc(client.name)}</b><br><small>${esc(client.company || "")}</small></td>
                <td>${esc(client.phone || "-")}<br><small>${esc(client.email || "")}</small></td>
                <td>${esc(client.service || "-")}</td>
                <td><mark>${esc(client.status)}</mark></td>
                <td>${money(client.value)}</td>
                <td class="trial-actions">
                  <button data-action="edit-client" data-id="${client.id}">Editar</button>
                  <button data-action="delete-client" data-id="${client.id}">Excluir</button>
                </td>
              </tr>`).join("")}
            </tbody>
          </table>` : empty("Nenhum cliente cadastrado.")}
      </div>`;
  }

  function worksPage() {
    return `
      <div class="panel">
        <div class="trial-section-head">
          <div><h3>Gestão de obras</h3><p>Organize as obras e acompanhe o andamento.</p></div>
          <button class="btn primary" data-action="new-work">Nova obra</button>
        </div>
        ${state.works.length ? `
          <div class="cards-list">${state.works.map(work => `
            <article>
              <b>${esc(work.title)}</b>
              <span>${esc(clientName(work.clientId))} • ${esc(work.status)}</span>
              <progress value="${Number(work.progress || 0)}" max="100"></progress>
              <small>${Number(work.progress || 0)}% concluído • ${money(work.value)}</small>
              <div class="trial-actions">
                <button data-action="edit-work" data-id="${work.id}">Editar</button>
                <button data-action="delete-work" data-id="${work.id}">Excluir</button>
              </div>
            </article>`).join("")}</div>` : empty("Nenhuma obra cadastrada.")}
      </div>`;
  }

  function financePage() {
    const entries = state.finance.filter(item => item.type === "Entrada").reduce((s, i) => s + Number(i.value || 0), 0);
    const expenses = state.finance.filter(item => item.type === "Saída").reduce((s, i) => s + Number(i.value || 0), 0);

    return `
      <div class="kpis">
        <article><small>Entradas</small><b>${money(entries)}</b></article>
        <article><small>Saídas</small><b>${money(expenses)}</b></article>
        <article><small>Saldo previsto</small><b>${money(entries - expenses)}</b></article>
        <article><small>Lançamentos</small><b>${state.finance.length}</b></article>
      </div>
      <div class="panel">
        <div class="trial-section-head">
          <div><h3>Financeiro</h3><p>Registre entradas, saídas e vencimentos.</p></div>
          <button class="btn primary" data-action="new-finance">Novo lançamento</button>
        </div>
        ${state.finance.length ? `
          <table class="trial-table">
            <thead><tr><th>Descrição</th><th>Cliente</th><th>Tipo</th><th>Valor</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>${state.finance.map(item => `
              <tr>
                <td><b>${esc(item.description)}</b></td>
                <td>${esc(clientName(item.clientId))}</td>
                <td>${esc(item.type)}</td>
                <td>${money(item.value)}</td>
                <td>${esc(item.due || "-")}</td>
                <td><mark>${esc(item.status)}</mark></td>
                <td class="trial-actions">
                  <button data-action="edit-finance" data-id="${item.id}">Editar</button>
                  <button data-action="delete-finance" data-id="${item.id}">Excluir</button>
                </td>
              </tr>`).join("")}
            </tbody>
          </table>` : empty("Nenhum lançamento financeiro cadastrado.")}
      </div>`;
  }

  function documentsPage() {
    return `
      <div class="panel">
        <div class="trial-section-head">
          <div><h3>Documentos</h3><p>Cadastre referências e observações de documentos durante o teste.</p></div>
          <button class="btn primary" data-action="new-document">Novo documento</button>
        </div>
        ${state.documents.length ? `
          <div class="docgrid">${state.documents.map(doc => `
            <article>
              <b>${esc(doc.title)}</b>
              <span>${esc(doc.category)} • ${esc(clientName(doc.clientId))}</span>
              <small>${esc(doc.notes || "Sem observações")}</small>
              <div class="trial-actions">
                <button data-action="edit-document" data-id="${doc.id}">Editar</button>
                <button data-action="delete-document" data-id="${doc.id}">Excluir</button>
              </div>
            </article>`).join("")}</div>` : empty("Nenhum documento cadastrado.")}
      </div>`;
  }

  function teamPage() {
    return `
      <div class="panel">
        <div class="trial-section-head">
          <div><h3>Equipe</h3><p>Cadastre colaboradores e suas funções.</p></div>
          <button class="btn primary" data-action="new-member">Novo colaborador</button>
        </div>
        ${state.team.length ? `
          <div class="cards-list">${state.team.map(member => `
            <article>
              <b>${esc(member.name)}</b>
              <span>${esc(member.role || "-")}</span>
              <small>${esc(member.email || member.phone || "")}</small>
              <div class="trial-actions">
                <button data-action="edit-member" data-id="${member.id}">Editar</button>
                <button data-action="delete-member" data-id="${member.id}">Excluir</button>
              </div>
            </article>`).join("")}</div>` : empty("Nenhum colaborador cadastrado.")}
      </div>`;
  }

  const pages = {
    dashboard: { title: "Dashboard", render: dashboardPage },
    crm: { title: "CRM", render: crmPage },
    obras: { title: "Obras", render: worksPage },
    financeiro: { title: "Financeiro", render: financePage },
    documentos: { title: "Documentos", render: documentsPage },
    equipe: { title: "Equipe", render: teamPage }
  };

  function render(page = currentPage) {
    currentPage = pages[page] ? page : "dashboard";
    document.getElementById("pageTitle").textContent = pages[currentPage].title;

    if (isExpired()) {
      document.getElementById("appContent").innerHTML = `
        <div class="trial-locked-panel">
          <div class="trial-lock-icon">🔒</div>
          <span class="badge">Dados protegidos</span>
          <h2>Seu período gratuito terminou</h2>
          <p>As informações cadastradas continuam salvas neste navegador, mas não ficam visíveis até a ativação de uma assinatura.</p>
          <p>Após a assinatura, o acesso aos dados poderá ser restaurado.</p>
          <a class="btn primary" href="pricing.html">Escolher plano e recuperar acesso</a>
        </div>`;
    } else {
      document.getElementById("appContent").innerHTML = pages[currentPage].render();
      bindActions();
      if (currentPage === "dashboard") animateDashboardCharts();
    }

  
  function animateDashboardCharts() {
    document.querySelectorAll("[data-counter]").forEach(element => {
      const target = Number(element.dataset.counter || 0);
      const start = performance.now();
      const duration = 850;
      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    document.querySelectorAll("[data-money-counter]").forEach(element => {
      const target = Number(element.dataset.moneyCounter || 0);
      const start = performance.now();
      const duration = 1000;
      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = money(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  document.querySelectorAll(".side-nav button").forEach(button => {
      button.classList.toggle("active", button.dataset.page === currentPage);
    });
    updateTrialHeader();
  }

  function clientForm(id = "") {
    if (!ensureActive()) return;
    const client = state.clients.find(item => item.id === id) || {};
    modal(`
      <h2>${id ? "Editar" : "Novo"} cliente</h2>
      <form id="trialClientForm" class="trial-form">
        <input type="hidden" name="id" value="${esc(id)}">
        ${field("Nome do cliente", "name", client.name, "text", true)}
        ${field("Empresa", "company", client.company)}
        ${field("WhatsApp", "phone", client.phone)}
        ${field("E-mail", "email", client.email, "email")}
        ${field("Serviço de interesse", "service", client.service)}
        ${field("Valor estimado", "value", client.value, "number")}
        ${selectField("Status", "status", ["Novo lead", "Contato realizado", "Cliente quente", "Proposta enviada", "Aguardando pagamento", "Fechado", "Perdido"], client.status || "Novo lead")}
        <label class="trial-field full"><span>Observações</span><textarea name="notes" rows="4">${esc(client.notes || "")}</textarea></label>
        <button class="btn primary full">Salvar cliente</button>
      </form>
    `);
    document.getElementById("trialClientForm").onsubmit = event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      const record = { ...client, ...data, id: id || uid(), value: Number(data.value || 0), updatedAt: Date.now() };
      state.clients = id ? state.clients.map(item => item.id === id ? record : item) : [...state.clients, record];
      saveState(); closeModal(); render("crm");
    };
  }

  function workForm(id = "") {
    if (!ensureActive()) return;
    const work = state.works.find(item => item.id === id) || {};
    modal(`
      <h2>${id ? "Editar" : "Nova"} obra</h2>
      <form id="trialWorkForm" class="trial-form">
        <input type="hidden" name="id" value="${esc(id)}">
        ${field("Nome da obra", "title", work.title, "text", true)}
        <label class="trial-field"><span>Cliente</span><select name="clientId">
          <option value="">Sem cliente</option>
          ${state.clients.map(client => `<option value="${client.id}" ${client.id === work.clientId ? "selected" : ""}>${esc(client.name)}</option>`).join("")}
        </select></label>
        ${field("Valor", "value", work.value, "number")}
        ${field("Progresso (%)", "progress", work.progress || 0, "number")}
        ${selectField("Status", "status", ["Planejamento", "Em andamento", "Pausada", "Finalizada"], work.status || "Planejamento")}
        <label class="trial-field full"><span>Descrição</span><textarea name="description" rows="4">${esc(work.description || "")}</textarea></label>
        <button class="btn primary full">Salvar obra</button>
      </form>
    `);
    document.getElementById("trialWorkForm").onsubmit = event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      const record = { ...work, ...data, id: id || uid(), value: Number(data.value || 0), progress: Math.min(100, Math.max(0, Number(data.progress || 0))) };
      state.works = id ? state.works.map(item => item.id === id ? record : item) : [...state.works, record];
      saveState(); closeModal(); render("obras");
    };
  }

  function financeForm(id = "") {
    if (!ensureActive()) return;
    const item = state.finance.find(record => record.id === id) || {};
    modal(`
      <h2>${id ? "Editar" : "Novo"} lançamento</h2>
      <form id="trialFinanceForm" class="trial-form">
        ${field("Descrição", "description", item.description, "text", true)}
        <label class="trial-field"><span>Cliente</span><select name="clientId">
          <option value="">Sem cliente</option>
          ${state.clients.map(client => `<option value="${client.id}" ${client.id === item.clientId ? "selected" : ""}>${esc(client.name)}</option>`).join("")}
        </select></label>
        ${selectField("Tipo", "type", ["Entrada", "Saída"], item.type || "Entrada")}
        ${field("Valor", "value", item.value, "number", true)}
        ${field("Vencimento", "due", item.due || today(), "date")}
        ${selectField("Status", "status", ["Pendente", "Pago", "Atrasado"], item.status || "Pendente")}
        <button class="btn primary full">Salvar lançamento</button>
      </form>
    `);
    document.getElementById("trialFinanceForm").onsubmit = event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      const record = { ...item, ...data, id: id || uid(), value: Number(data.value || 0) };
      state.finance = id ? state.finance.map(entry => entry.id === id ? record : entry) : [...state.finance, record];
      saveState(); closeModal(); render("financeiro");
    };
  }

  function documentForm(id = "") {
    if (!ensureActive()) return;
    const doc = state.documents.find(item => item.id === id) || {};
    modal(`
      <h2>${id ? "Editar" : "Novo"} documento</h2>
      <form id="trialDocumentForm" class="trial-form">
        ${field("Título", "title", doc.title, "text", true)}
        <label class="trial-field"><span>Cliente</span><select name="clientId">
          <option value="">Sem cliente</option>
          ${state.clients.map(client => `<option value="${client.id}" ${client.id === doc.clientId ? "selected" : ""}>${esc(client.name)}</option>`).join("")}
        </select></label>
        ${selectField("Categoria", "category", ["Contrato", "Proposta", "Projeto", "Medição", "Nota fiscal", "Outros"], doc.category || "Contrato")}
        <label class="trial-field full"><span>Observações</span><textarea name="notes" rows="5">${esc(doc.notes || "")}</textarea></label>
        <button class="btn primary full">Salvar documento</button>
      </form>
    `);
    document.getElementById("trialDocumentForm").onsubmit = event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      const record = { ...doc, ...data, id: id || uid() };
      state.documents = id ? state.documents.map(item => item.id === id ? record : item) : [...state.documents, record];
      saveState(); closeModal(); render("documentos");
    };
  }

  function memberForm(id = "") {
    if (!ensureActive()) return;
    const member = state.team.find(item => item.id === id) || {};
    modal(`
      <h2>${id ? "Editar" : "Novo"} colaborador</h2>
      <form id="trialMemberForm" class="trial-form">
        ${field("Nome", "name", member.name, "text", true)}
        ${field("Cargo / função", "role", member.role)}
        ${field("E-mail", "email", member.email, "email")}
        ${field("WhatsApp", "phone", member.phone)}
        <button class="btn primary full">Salvar colaborador</button>
      </form>
    `);
    document.getElementById("trialMemberForm").onsubmit = event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      const record = { ...member, ...data, id: id || uid() };
      state.team = id ? state.team.map(item => item.id === id ? record : item) : [...state.team, record];
      saveState(); closeModal(); render("equipe");
    };
  }

  function companyForm() {
    if (!ensureActive()) return;
    modal(`
      <h2>Ativar teste gratuito</h2>
      <p>Preencha os dados para identificar sua empresa e salvar seu período de teste.</p>
      <form id="trialCompanyForm" class="trial-form">
        ${field("Nome da empresa", "name", state.company.name, "text", true)}
        ${field("Nome do responsável", "responsible", state.company.responsible, "text", true)}
        ${field("E-mail", "email", state.company.email, "email", true)}
        ${field("WhatsApp", "phone", state.company.phone, "tel", true)}
        <label class="trial-consent full">
          <input type="checkbox" name="marketingConsent" ${state.company.marketingConsent ? "checked" : ""}>
          <span>Autorizo a AXIS Solutions a entrar em contato por e-mail ou WhatsApp com informações sobre o sistema, demonstrações e condições comerciais.</span>
        </label>
        <button class="btn primary full">Salvar e continuar teste</button>
      </form>
    `);
    document.getElementById("trialCompanyForm").onsubmit = async event => {
      event.preventDefault();
      const formData = Object.fromEntries(new FormData(event.target).entries());
      const payload = {
        companyName: formData.name,
        name: formData.responsible,
        email: formData.email,
        phone: formData.phone,
        marketingConsent: Boolean(formData.marketingConsent)
      };

      const response = await fetch('/api/trial-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!result.ok) {
        alert(result.error || 'Não foi possível salvar os dados.');
        return;
      }

      state.company = {
        ...state.company,
        name: formData.name,
        responsible: formData.responsible,
        email: formData.email,
        phone: formData.phone,
        marketingConsent: Boolean(formData.marketingConsent),
        leadSaved: true
      };

      saveState();
      closeModal();
      render(currentPage);
    };
  }

  function deleteRecord(collection, id, page) {
    if (!ensureActive()) return;
    if (!confirm("Excluir este registro?")) return;
    state[collection] = state[collection].filter(item => item.id !== id);
    saveState(); render(page);
  }

  function bindActions() {
    document.querySelectorAll("[data-action]").forEach(button => {
      button.onclick = () => {
        const action = button.dataset.action;
        const id = button.dataset.id || "";
        const handlers = {
          "new-client": () => clientForm(),
          "edit-client": () => clientForm(id),
          "delete-client": () => deleteRecord("clients", id, "crm"),
          "new-work": () => workForm(),
          "edit-work": () => workForm(id),
          "delete-work": () => deleteRecord("works", id, "obras"),
          "new-finance": () => financeForm(),
          "edit-finance": () => financeForm(id),
          "delete-finance": () => deleteRecord("finance", id, "financeiro"),
          "new-document": () => documentForm(),
          "edit-document": () => documentForm(id),
          "delete-document": () => deleteRecord("documents", id, "documentos"),
          "new-member": () => memberForm(),
          "edit-member": () => memberForm(id),
          "delete-member": () => deleteRecord("team", id, "equipe")
        };
        handlers[action]?.();
      };
    });
  }


  function animateDashboardCharts() {
    document.querySelectorAll("[data-counter]").forEach(element => {
      const target = Number(element.dataset.counter || 0);
      const start = performance.now();
      const duration = 850;
      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    document.querySelectorAll("[data-money-counter]").forEach(element => {
      const target = Number(element.dataset.moneyCounter || 0);
      const start = performance.now();
      const duration = 1000;
      const tick = now => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = money(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  document.querySelectorAll(".side-nav button").forEach(button => {
    button.onclick = () => render(button.dataset.page);
  });

  document.getElementById("editCompanyBtn").onclick = companyForm;
  document.getElementById("trialClose").onclick = closeModal;
  document.getElementById("trialModal").onclick = event => {
    if (event.target.id === "trialModal") closeModal();
  };

  if (!localStorage.getItem(TRIAL_KEY)) saveState();
  updateTrialHeader();
  render("dashboard");
  if (!state.company.leadSaved) {
    setTimeout(companyForm, 350);
  }

  setInterval(updateTrialHeader, 60 * 1000);
})();
