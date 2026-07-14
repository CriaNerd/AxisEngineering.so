const tokenKey = 'axis_admin_token';
function $(id){return document.getElementById(id)}
function token(){return localStorage.getItem(tokenKey)||''}
function money(n){return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}

async function loadSiteSettings(){
  const r=await fetch('/api/axis-admin/site-settings',{headers:{Authorization:'Bearer '+token()}});
  if(r.status===401){logoutAdmin();return}
  const j=await r.json(); if(!j.ok)return;
  const s=j.settings;
  $('siteProductName').value=s.productName||'';
  $('siteShortName').value=s.shortName||'';
  $('siteTagline').value=s.tagline||'';
  $('sitePrimaryColor').value=s.primaryColor||'#b91c1c';
  $('siteAccentColor').value=s.accentColor||'#c9972e';
  $('siteHighlightColor').value=s.highlightColor||'#f1c96b';
  $('siteFooterText').value=s.footerText||'';
  $('siteLogoPreview').src=s.logo||'/assets/axis-logo-premium.svg';
}
function readFileAsDataURL(file){return new Promise((resolve)=>{ if(!file)return resolve(''); const r=new FileReader(); r.onload=()=>resolve(r.result); r.readAsDataURL(file); });}
async function saveSiteSettings(){
  $('siteMsg').textContent='Salvando...';
  const logoFile=$('siteLogoFile').files[0];
  const payload={
    productName:$('siteProductName').value,
    shortName:$('siteShortName').value,
    tagline:$('siteTagline').value,
    primaryColor:$('sitePrimaryColor').value,
    accentColor:$('siteAccentColor').value,
    highlightColor:$('siteHighlightColor').value,
    footerText:$('siteFooterText').value
  };
  const logo=await readFileAsDataURL(logoFile); if(logo) payload.logo=logo;
  const r=await fetch('/api/axis-admin/site-settings',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify(payload)});
  const j=await r.json();
  if(!j.ok){$('siteMsg').textContent=j.error||'Erro ao salvar aparência';return}
  $('siteMsg').textContent='Aparência salva com sucesso.';
  loadSiteSettings();
}

async function loginAdmin(){
  $('loginMsg').textContent='Entrando...';
  const r=await fetch('/api/axis-admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:$('adminEmail').value,password:$('adminPassword').value})});
  const j=await r.json();
  if(!j.ok){$('loginMsg').textContent=j.error||'Erro no login';return}
  localStorage.setItem(tokenKey,j.token);showPanel();loadSubscribers();loadSiteSettings();loadLeads();
}
function logoutAdmin(){localStorage.removeItem(tokenKey);location.reload()}
function showPanel(){ $('loginBox').classList.add('hidden'); $('panelBox').classList.remove('hidden') }
async function loadSubscribers(){
  const r=await fetch('/api/axis-admin/subscribers',{headers:{Authorization:'Bearer '+token()}});
  if(r.status===401){logoutAdmin();return}
  const j=await r.json(); if(!j.ok)return alert(j.error||'Erro ao carregar');
  const s=j.summary;
  $('metrics').innerHTML=`<div class="metric"><small>Total</small><b>${s.total}</b></div><div class="metric"><small>Ativos</small><b>${s.active}</b></div><div class="metric"><small>Pendentes</small><b>${s.pending}</b></div><div class="metric"><small>Trial</small><b>${s.trial}</b></div><div class="metric"><small>MRR</small><b>${money(s.mrr)}</b></div>`;
  $('subscribersBody').innerHTML=j.subscribers.map(x=>`<tr><td><b>${x.company||'-'}</b><br><small>${x.email||''}</small></td><td>${x.admin||'-'}</td><td>${x.planName||x.plan||'-'}<br><small>${money(x.monthlyValue)}/mês</small></td><td><span class="status ${x.status}">${x.status||'-'}</span></td><td>${x.subscriptionStatus||'-'}<br><small>${x.subscriptionId||''}</small></td><td>${x.createdAt?new Date(x.createdAt).toLocaleString('pt-BR'):'-'}</td><td><div class="admin-actions"><button onclick="setStatus('${x.id}','active','${x.plan||'professional'}')">Ativar</button><button onclick="setStatus('${x.id}','inactive','${x.plan||'professional'}')">Desativar</button><button onclick="cancelSubscription('${x.id}')">Cancelar assinatura</button></div></td></tr>`).join('') || '<tr><td colspan="7">Nenhum assinante ainda.</td></tr>';
  $('eventsBox').innerHTML=(j.events||[]).map(e=>`<div><b>${e.type}</b> • ${e.createdAt?new Date(e.createdAt).toLocaleString('pt-BR'):''}<br><small>${e.companyId||e.proposalId||e.subscriptionId||''}</small></div><hr>`).join('');
}
async function setStatus(id,status,plan){
  const r=await fetch('/api/axis-admin/subscribers/'+id+'/status',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({status,plan})});
  const j=await r.json(); if(!j.ok)return alert(j.error||'Erro ao atualizar'); loadSubscribers();
}
if(token()){showPanel();loadSubscribers();loadSiteSettings();loadLeads()}


async function cancelSubscription(id){
  if(!confirm('Cancelar a assinatura deste assinante?')) return;
  const r=await fetch('/api/axis-admin/subscribers/'+id+'/cancel',{method:'POST',headers:{Authorization:'Bearer '+token()}});
  const j=await r.json();
  if(!j.ok)return alert(j.error||'Erro ao cancelar assinatura');
  alert('Assinatura cancelada com sucesso.');
  loadSubscribers();
}


let axisLeadsCache = [];

async function loadLeads(){
  const r = await fetch('/api/axis-admin/leads', {
    headers: { Authorization: 'Bearer ' + token() }
  });
  if(r.status === 401){ logoutAdmin(); return; }

  const j = await r.json();
  if(!j.ok) return alert(j.error || 'Erro ao carregar leads');

  axisLeadsCache = j.leads || [];
  $('leadsSummary').innerHTML = `<p><b>${j.total}</b> leads cadastrados • <b>${j.consented}</b> autorizaram contato comercial.</p>`;

  $('leadsBody').innerHTML = axisLeadsCache.map(lead => `
    <tr>
      <td><b>${lead.name || '-'}</b></td>
      <td>${lead.companyName || '-'}</td>
      <td>${lead.email || '-'}</td>
      <td>${lead.phone || '-'}</td>
      <td>${lead.marketingConsent ? '<span class="status active">Autorizado</span>' : '<span class="status inactive">Não autorizado</span>'}</td>
      <td>${lead.createdAt ? new Date(lead.createdAt).toLocaleString('pt-BR') : '-'}</td>
    </tr>
  `).join('') || '<tr><td colspan="6">Nenhum lead cadastrado.</td></tr>';
}

function exportLeadsCsv(){
  const rows = [
    ['Responsável','Empresa','E-mail','WhatsApp','Consentimento de marketing','Data de cadastro'],
    ...axisLeadsCache.map(lead => [
      lead.name || '',
      lead.companyName || '',
      lead.email || '',
      lead.phone || '',
      lead.marketingConsent ? 'Sim' : 'Não',
      lead.createdAt || ''
    ])
  ];

  const csv = rows
    .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads-axis.csv';
  a.click();
  URL.revokeObjectURL(url);
}
