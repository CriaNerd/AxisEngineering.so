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
  localStorage.setItem(tokenKey,j.token);showPanel();loadSubscribers();loadSiteSettings();
}
function logoutAdmin(){localStorage.removeItem(tokenKey);location.reload()}
function showPanel(){ $('loginBox').classList.add('hidden'); $('panelBox').classList.remove('hidden') }
async function loadSubscribers(){
  const r=await fetch('/api/axis-admin/subscribers',{headers:{Authorization:'Bearer '+token()}});
  if(r.status===401){logoutAdmin();return}
  const j=await r.json(); if(!j.ok)return alert(j.error||'Erro ao carregar');
  const s=j.summary;
  $('metrics').innerHTML=`<div class="metric"><small>Total</small><b>${s.total}</b></div><div class="metric"><small>Ativos</small><b>${s.active}</b></div><div class="metric"><small>Pendentes</small><b>${s.pending}</b></div><div class="metric"><small>Trial</small><b>${s.trial}</b></div><div class="metric"><small>MRR</small><b>${money(s.mrr)}</b></div>`;
  $('subscribersBody').innerHTML=j.subscribers.map(x=>`<tr><td><b>${x.company||'-'}</b><br><small>${x.email||''}</small></td><td>${x.admin||'-'}</td><td>${x.planName||x.plan||'-'}<br><small>${money(x.monthlyValue)}/mês</small></td><td><span class="status ${x.status}">${x.status||'-'}</span></td><td>${x.subscriptionStatus||'-'}<br><small>${x.subscriptionId||''}</small></td><td>${x.createdAt?new Date(x.createdAt).toLocaleString('pt-BR'):'-'}</td><td><div class="admin-actions"><button onclick="setStatus('${x.id}','active','${x.plan||'professional'}')">Ativar</button><button onclick="setStatus('${x.id}','inactive','${x.plan||'professional'}')">Desativar</button></div></td></tr>`).join('') || '<tr><td colspan="7">Nenhum assinante ainda.</td></tr>';
  $('eventsBox').innerHTML=(j.events||[]).map(e=>`<div><b>${e.type}</b> • ${e.createdAt?new Date(e.createdAt).toLocaleString('pt-BR'):''}<br><small>${e.companyId||e.proposalId||e.subscriptionId||''}</small></div><hr>`).join('');
}
async function setStatus(id,status,plan){
  const r=await fetch('/api/axis-admin/subscribers/'+id+'/status',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token()},body:JSON.stringify({status,plan})});
  const j=await r.json(); if(!j.ok)return alert(j.error||'Erro ao atualizar'); loadSubscribers();
}
if(token()){showPanel();loadSubscribers();loadSiteSettings()}
