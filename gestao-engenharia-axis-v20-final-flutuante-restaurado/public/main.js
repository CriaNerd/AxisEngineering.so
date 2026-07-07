async function applyPublicSiteSettings(){
  try{
    const r=await fetch('/api/site-settings',{cache:'no-store'});
    const j=await r.json();
    if(!j.ok||!j.settings)return;
    const s=j.settings;
    document.documentElement.style.setProperty('--blue', s.primaryColor || '#b91c1c');
    document.documentElement.style.setProperty('--cyan', s.accentColor || '#c9972e');
    document.documentElement.style.setProperty('--gold', s.accentColor || '#c9972e');
    document.documentElement.style.setProperty('--red', s.primaryColor || '#b91c1c');
    document.title = document.title.replace(/AXIS Engineering OS V\d+|AXIS Engineering OS|AXIS Solutions V\d+|AXIS Solutions|Planos AXIS V\d+|Criar empresa AXIS|Recuperar senha AXIS|Nova senha AXIS/g, s.productName || 'Gestão Engenharia AXIS');
    document.querySelectorAll('.mark img').forEach(img=>{img.src=s.logo||'/assets/axis-logo-premium.svg'; img.classList.add('brand-logo-wide')});
    document.querySelectorAll('.pay-logo,.hero-art img,.ai>button img').forEach(img=>{img.src=s.emblem||'/assets/axis-emblem-premium.svg'});
    document.querySelectorAll('[data-brand-name]').forEach(el=>el.textContent=s.productName||'Gestão Engenharia AXIS');
    document.querySelectorAll('[data-brand-footer]').forEach(el=>el.textContent=s.footerText||'Gestão Engenharia AXIS © 2026');
  }catch(e){console.warn('Aparência pública não carregada', e.message)}
}
applyPublicSiteSettings();
const root=document.documentElement;
const saved=localStorage.getItem('axis-theme'); if(saved) root.setAttribute('data-theme', saved);
document.querySelectorAll('.theme-toggle').forEach(btn=>{btn.textContent=root.getAttribute('data-theme')==='light'?'☀':'☾';btn.onclick=()=>{const next=root.getAttribute('data-theme')==='light'?'dark':'light';root.setAttribute('data-theme',next);localStorage.setItem('axis-theme',next);document.querySelectorAll('.theme-toggle').forEach(b=>b.textContent=next==='light'?'☀':'☾')}});
const planForm=document.getElementById('planForm');
document.querySelectorAll('.subscribe').forEach(btn=>btn.addEventListener('click',()=>{ if(planForm){planForm.plan.value=btn.dataset.plan; planForm.scrollIntoView({behavior:'smooth',block:'center'}); planForm.querySelector('input[name=companyName]').focus();}}));
if(planForm){planForm.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(planForm).entries());const r=await fetch('/api/create-subscription-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json();if(j.url) location.href=j.url; else alert(j.error||'Erro ao criar checkout');});}
const oldPay=document.getElementById('payForm');
if(oldPay){oldPay.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(oldPay).entries());data.plan='professional';const r=await fetch('/api/create-subscription-checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json();if(j.url) location.href=j.url; else alert(j.error||'Erro ao criar checkout');});}
const ai=document.querySelector('.ai'); const aiOpen=document.getElementById('aiOpen'); if(aiOpen) aiOpen.onclick=()=>ai.classList.toggle('open');
