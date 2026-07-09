const pages={
 dashboard:{title:'Dashboard',html:`<div class="kpis"><article><small>Receita prevista</small><b>R$ 286.420</b><em>+12,9% mês anterior</em></article><article><small>Obras em andamento</small><b>15</b><em>3 novas obras</em></article><article><small>Propostas abertas</small><b>27</b><em>R$ 318k em negociação</em></article><article><small>Pagamentos gerados</small><b>42</b><em>Links Mercado Pago</em></article></div><div class="dashboard-grid"><div class="panel wide"><h3>Receita x Despesa</h3><div class="linechart"><svg viewBox="0 0 500 180"><polyline points="0,150 55,110 110,128 165,80 220,102 275,50 330,88 385,42 440,60 500,18"/><polyline class="danger" points="0,160 55,145 110,120 165,115 220,90 275,96 330,70 385,82 440,48 500,40"/></svg></div></div><div class="panel"><h3>Fechamentos</h3><div class="donut"></div><p>36% das propostas pagas por link</p></div><div class="panel"><h3>Fluxo de Caixa</h3><div class="cash"><span>Entradas <b>R$ 68.900</b></span><span>Saídas <b class="red">R$ 32.480</b></span><span>Saldo <b>R$ 36.420</b></span></div></div><div class="panel wide"><h3>Contratos recentes</h3><table><tr><th>Obra</th><th>Cliente</th><th>Status</th><th>Valor</th></tr><tr><td>Edifício Aurora</td><td>Construtora Silva</td><td><mark>Link enviado</mark></td><td>R$ 24.500</td></tr><tr><td>Centro Empresarial Axis</td><td>Grupo Projeção</td><td><mark>Pago</mark></td><td>R$ 19.900</td></tr><tr><td>Hospital São Gabriel</td><td>Governo Municipal</td><td><mark>Proposta</mark></td><td>R$ 32.800</td></tr></table></div></div>`},
 crm:{title:'CRM',html:`<div class="kanban"><div><h3>Novos leads</h3><p>Construtora Delta</p><p>Residencial Norte</p><p>Grupo Horizonte</p></div><div><h3>Proposta enviada</h3><p>Shopping Center Norte</p><p>Hospital São Gabriel</p></div><div><h3>Pagamento pendente</h3><p>Condomínio Vista Verde</p><p>Edifício Aurora</p></div><div><h3>Fechados</h3><p>Centro Empresarial Axis</p><p>Obra Porto Azul</p></div></div>`},
 obras:{title:'Obras',html:`<div class="cards-list"><article><b>Edifício Residencial Aurora</b><span>68% concluído</span><progress value="68" max="100"></progress></article><article><b>Centro Empresarial Axis</b><span>42% concluído</span><progress value="42" max="100"></progress></article><article><b>Hospital São Gabriel</b><span>81% concluído</span><progress value="81" max="100"></progress></article></div>`},
 propostas:{title:'Propostas & Pagamentos',html:`<div class="proposal-layout"><div class="panel proposal-panel"><span class="badge">Novo fechamento</span><h3>Criar proposta + link de pagamento</h3><p>Use essa área para a empresa de engenharia enviar uma proposta profissional e um checkout Mercado Pago para o cliente pagar o contrato.</p><form id="proposalForm" class="smart-form"><input name="companyName" value="Axis Demo Engenharia" placeholder="Empresa de engenharia"><input name="clientName" placeholder="Nome do cliente"><input name="clientEmail" type="email" placeholder="E-mail do cliente"><input name="title" value="Proposta de projeto executivo" placeholder="Título da proposta"><textarea name="description" placeholder="Descrição do serviço">Projeto executivo, acompanhamento técnico e gestão documental da obra.</textarea><div class="form-row"><input name="amount" value="18500" placeholder="Valor"><select name="currency"><option value="brl">BRL - PIX/cartão/boleto</option></select></div><button class="btn primary full">Gerar proposta e link</button></form><div id="proposalResult" class="proposal-result"></div></div><div class="panel"><h3>Modelo de mensagem</h3><p class="quote">Olá, segue a proposta da sua obra com o link seguro para pagamento. Após a confirmação, nossa equipe inicia a próxima etapa do contrato.</p><div class="cash"><span>Propostas enviadas <b>27</b></span><span>Aguardando pagamento <b>R$ 88.300</b></span><span>Pagas este mês <b>R$ 142.900</b></span></div></div></div>`},
 financeiro:{title:'Financeiro',html:`<div class="kpis"><article><small>A receber</small><b>R$ 241.200</b></article><article><small>A pagar</small><b>R$ 72.650</b></article><article><small>Links criados</small><b>36</b></article><article><small>Pagamentos pagos</small><b>22</b></article></div><div class="panel"><h3>Pagamento integrado</h3><p>Crie links de pagamento para contratos, acompanhe status e use Mercado Pago para receber via PIX, cartão e boleto conforme sua conta Mercado Pago.</p><button class="btn primary" data-goto="propostas">Criar link de pagamento</button></div>`},
 caixa:{title:'Fluxo de Caixa',html:`<div class="panel wide"><h3>Previsão mensal</h3><div class="barline"><i style="height:40%"></i><i style="height:70%"></i><i style="height:50%"></i><i style="height:90%"></i><i style="height:75%"></i><i style="height:96%"></i></div></div>`},
 documentos:{title:'Documentos',html:`<div class="docgrid"><article>📄 Contrato Aurora.pdf</article><article>🧾 Nota fiscal 2031.xml</article><article>📐 Projeto estrutural.dwg</article><article>💳 Comprovante Mercado Pago</article></div>`},
 relatorios:{title:'Relatórios',html:`<div class="feature-grid"><article><b>Relatório Comercial</b><p>Leads, conversão e propostas.</p></article><article><b>Relatório Financeiro</b><p>Receitas, despesas e lucro.</p></article><article><b>Relatório de Obras</b><p>Status e gargalos por projeto.</p></article></div>`},
 equipe:{title:'Equipe',html:`<div class="cards-list"><article><b>Ana Lima</b><span>Engenheira Responsável</span></article><article><b>Carlos Martins</b><span>Financeiro</span></article><article><b>Marina Souza</b><span>Comercial</span></article></div>`},
 assinatura:{title:'Assinatura',html:`<div class="panel proposal-panel"><span class="badge">Gestão da assinatura</span><h3>Cancelar assinatura</h3><p>O cancelamento pode ser solicitado pelo assinante usando o e-mail cadastrado. Se a assinatura estiver vinculada ao Mercado Pago, o sistema tenta cancelar também no Mercado Pago.</p><form id="cancelSubscriptionForm" class="smart-form"><input name="email" type="email" placeholder="E-mail da assinatura"><button class="btn primary full">Cancelar assinatura</button></form><div id="cancelResult" class="proposal-result"></div></div>`},
 suporte:{title:'Suporte',html:`<div class="panel proposal-panel"><span class="badge">Atendimento AXIS</span><h3>Falar com suporte</h3><p>Assinantes podem falar com o suporte da AXIS pelo WhatsApp para dúvidas de acesso, pagamento, configuração e uso do sistema.</p><a class="btn primary full" target="_blank" rel="noopener" href="https://wa.me/5521966390331?text=Ol%C3%A1%2C%20sou%20assinante%20do%20Gest%C3%A3o%20Engenharia%20AXIS%20e%20preciso%20de%20suporte.">Falar com suporte</a></div>`}
};
function render(page='dashboard'){document.getElementById('pageTitle').textContent=pages[page].title;document.getElementById('appContent').innerHTML=pages[page].html;document.querySelectorAll('.side-nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));bindPageActions();}
document.querySelectorAll('.side-nav button').forEach(b=>b.onclick=()=>render(b.dataset.page));
function bindPageActions(){document.querySelectorAll('[data-goto]').forEach(b=>b.onclick=()=>render(b.dataset.goto));const f=document.getElementById('proposalForm');if(f){f.addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(f).entries());const result=document.getElementById('proposalResult');result.innerHTML='<b>Gerando link seguro...</b>';const r=await fetch('/api/create-proposal-payment-link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const j=await r.json();if(j.url){const msg=`Olá ${data.clientName||''}, segue a proposta ${data.title} no valor de R$ ${data.amount}. Link seguro Mercado Pago para pagamento e fechamento do contrato: ${j.url}`;result.innerHTML=`<b>Proposta criada com sucesso.</b><p>Link de pagamento:</p><input readonly value="${j.url}"><div class="actions"><a class="btn primary" target="_blank" href="${j.url}">Abrir checkout</a><a class="btn ghost" target="_blank" href="https://wa.me/?text=${encodeURIComponent(msg)}">Enviar pelo WhatsApp</a><a class="btn ghost" href="mailto:${data.clientEmail}?subject=${encodeURIComponent('Proposta - '+data.title)}&body=${encodeURIComponent(msg)}">Enviar por e-mail</a></div>`;}else result.innerHTML='<b>Erro:</b> '+(j.error||'não foi possível criar link');});}

  const cancelForm=document.getElementById('cancelSubscriptionForm');
  if(cancelForm){
    cancelForm.addEventListener('submit',async e=>{
      e.preventDefault();
      const result=document.getElementById('cancelResult');
      result.innerHTML='<b>Processando cancelamento...</b>';
      const data=Object.fromEntries(new FormData(cancelForm).entries());
      const r=await fetch('/api/subscriber/cancel-subscription',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const j=await r.json();
      result.innerHTML=j.ok?`<b>${j.message||'Assinatura cancelada com sucesso.'}</b><p>Status: ${j.company?.subscriptionStatus||'cancelled'}</p>`:`<b>Erro:</b> ${j.error||'Não foi possível cancelar agora.'}`;
    });
  }
}
render();


// Axis AI - assistente pronto para a demo e liberado a partir do Professional
function askAxisAI(message){
  return fetch('/api/axis-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plan:'professional',message})}).then(r=>r.json()).then(j=>j.answer || 'Não consegui responder agora.');
}
document.querySelectorAll('[data-ai]').forEach(btn=>btn.addEventListener('click', async()=>{
  const box=document.getElementById('aiAnswer');
  if(!box) return;
  box.textContent='Pensando...';
  box.textContent=await askAxisAI(btn.dataset.ai);
}));
const aiInput=document.getElementById('aiInput');
if(aiInput){aiInput.addEventListener('keydown', async e=>{
  if(e.key==='Enter'){
    const box=document.getElementById('aiAnswer');
    box.textContent='Pensando...';
    box.textContent=await askAxisAI(aiInput.value);
    aiInput.value='';
  }
});}
