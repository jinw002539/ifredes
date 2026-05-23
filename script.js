/* ============================================================
   LF REDES & CONSULTORIA — script.js
   Todo o JavaScript do site
   ============================================================ */

/* ── Menu Hamburger ──────────────────────────────────────────*/
function toggleMenu() {
  const links    = document.getElementById('nav-links');
  const burger   = document.getElementById('nav-hamburger');
  const backdrop = document.getElementById('nav-backdrop');
  const aberto   = links.classList.toggle('open');
  burger.classList.toggle('open', aberto);
  backdrop.classList.toggle('open', aberto);
  document.body.style.overflow = aberto ? 'hidden' : '';
}

function fecharMenu() {
  document.getElementById('nav-links').classList.remove('open');
  document.getElementById('nav-hamburger').classList.remove('open');
  document.getElementById('nav-backdrop').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Cards de serviço: hover tag + clique vai para preço ─────*/
const mapaServico = {
  'Criação de Empresas':        'pc-criacao',
  'Contabilidade Organizada':   'pc-contabilidade',
  'Abertura de Conta Bancária': 'pc-conta-banco',
  'Registro no INSS':           'pc-inss',
  'Análise de Documentos':      'pc-analise',
  'Reserva de Nome':            'pc-reserva',
  'Certidão Definitiva':        'pc-certidao',
  'Emissão de Alvará':          'pc-alvara',
  'NUIT Empresarial':           'pc-nuit',
  'Pagamento de IVA':           'pc-iva',
  'Contrato de Sociedade':      'pc-contrato',
  'Mão de Obra':                'pc-maodeobra',
};

document.querySelectorAll('.sc').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const nome   = card.querySelector('h4').textContent.trim();
    const alvo   = mapaServico[nome];
    const target = alvo ? document.getElementById(alvo) : null;

    if (target) {
      document.getElementById('precos').scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('pc-highlight');
        setTimeout(() => target.classList.remove('pc-highlight'), 2200);
      }, 400);
    } else {
      const preco = card.dataset.valor || '';
      abrirModal(nome, preco);
    }
  });
});

/* ── Navbar scroll ───────────────────────────────────────────*/
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 30);
});

/* ── Reveal on scroll ────────────────────────────────────────*/
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── Modal de contacto simples ───────────────────────────────*/
let _pacote = '', _preco = '';

function abrirModal(pacote, preco) {
  _pacote = pacote; _preco = preco;
  const label = preco ? `${pacote} — ${preco}` : pacote;
  document.getElementById('modal-pacote-label').textContent = label;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-nome').focus();
}

function fecharModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) fecharModal();
});

function irWhatsApp(e) {
  e.preventDefault();
  const nome  = document.getElementById('modal-nome').value.trim();
  const email = document.getElementById('modal-email').value.trim();
  if (!nome) { document.getElementById('modal-nome').focus(); return; }

  let msg = `Olá! Sou *${nome}*`;
  if (email) msg += ` (${email})`;
  msg += ` e tenho interesse no serviço: *${_pacote}*`;
  if (_preco) msg += ` — *${_preco}*`;
  msg += '.\n\nPoderia dar-me mais informações?';

  const url = `https://wa.me/258845698732?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  fecharModal();
  document.getElementById('modal-form').reset();
}

/* ── Formulário de contacto ──────────────────────────────────*/
function enviarFormContacto(e) {
  e.preventDefault();
  const form = e.target;
  const nome = form.querySelector('input[type="text"]').value.trim();
  const tel  = form.querySelector('input[type="tel"]').value.trim();
  const serv = form.querySelector('select').value;

  let msg = `Olá! Sou *${nome}* (${tel})`;
  if (serv) msg += ` e tenho interesse em: *${serv}*`;
  msg += '.\n\nAgradecia o vosso contacto.';

  const url = `https://wa.me/258845698732?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

/* ── ESC fecha todos os modais ───────────────────────────────*/
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { fecharModal(); fecharCotacao(); }
});


/* ╔══════════════════════════════════════════════════════════╗
   ║         SISTEMA DE COTAÇÃO MULTI-SERVIÇO                 ║
   ╚══════════════════════════════════════════════════════════╝ */

/* Base de dados dos serviços com preços e período */
const SERVICOS_DB = {
  'Reserva de Nome':             { preco: 400,    periodo: 'unico'  },
  'Contrato de Sociedade':       { preco: 2500,   periodo: 'unico'  },
  'Certidão Definitiva':         { preco: 2500,   periodo: 'unico'  },
  'NUIT Empresarial':            { preco: 1000,   periodo: 'unico'  },
  'Alvará':                      { preco: 4900,   periodo: 'unico'  },
  'Mão de Obra':                 { preco: 5000,   periodo: 'unico'  },
  'Abertura de Conta Bancária':  { preco: 8500,   periodo: 'unico'  },
  'Registro no INSS':            { preco: 5000,   periodo: 'unico'  },
  'Análise de Documentos':       { preco: 2000,   periodo: 'unico'  },
  'Contabilidade Organizada':    { preco: 10000,  periodo: 'mensal' },
  'Pagamento de IVA':            { preco: 4000,   periodo: 'mensal' },
};

/* Carrinho de serviços seleccionados */
let carrinho = {};

/* Formatar número: 12500 → 12.500 */
function fmt(n) {
  return n.toLocaleString('pt-PT');
}

/* ── Seleccionar / desseleccionar um card de preço ───────────*/
function toggleSelecao(btn) {
  const card    = btn.closest('.preco-card');
  const nome    = card.querySelector('.pc-nome').textContent.trim();
  const info    = SERVICOS_DB[nome];

  /* Se o serviço não tem preço fixo, abre o modal normal */
  if (!info) {
    const labelPreco = card.querySelector('.pc-periodo') ?
      card.querySelector('.pc-periodo').textContent.trim() : '';
    abrirModal(nome, labelPreco);
    return;
  }

  if (carrinho[nome]) {
    /* Remover do carrinho */
    delete carrinho[nome];
    card.classList.remove('pc-selecionado');
    btn.innerHTML = '<i class="fa fa-plus-circle"></i> Adicionar à Cotação';
    btn.classList.remove('btn-selecionado');
  } else {
    /* Adicionar ao carrinho */
    carrinho[nome] = { preco: info.preco, periodo: info.periodo };
    card.classList.add('pc-selecionado');
    btn.innerHTML = '<i class="fa fa-check-circle"></i> Adicionado ✓';
    btn.classList.add('btn-selecionado');
  }

  actualizarFAB();
}

/* ── Actualizar o botão flutuante ────────────────────────────*/
function actualizarFAB() {
  const count  = Object.keys(carrinho).length;
  const fab    = document.getElementById('cot-fab');
  const badge  = document.getElementById('cot-badge');

  badge.textContent  = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
  fab.classList.toggle('cot-fab-ativo', count > 0);
}

/* ── Calcular totais ─────────────────────────────────────────*/
function calcularTotais() {
  let totalUnico  = 0;
  let totalMensal = 0;
  Object.values(carrinho).forEach(s => {
    if (s.periodo === 'unico')  totalUnico  += s.preco;
    if (s.periodo === 'mensal') totalMensal += s.preco;
  });
  return { totalUnico, totalMensal, total: totalUnico + totalMensal };
}

/* ── Abrir modal de cotação ──────────────────────────────────*/
function abrirCotacao() {
  if (Object.keys(carrinho).length === 0) {
    /* Sem serviços: rola para preços e mostra toast */
    document.getElementById('precos').scrollIntoView({ behavior: 'smooth' });
    mostrarToast('Clique em "Adicionar à Cotação" nos serviços desejados');
    return;
  }
  renderLista();
  document.getElementById('cot-step-1').style.display = 'block';
  document.getElementById('cot-step-2').style.display = 'none';
  document.getElementById('modal-cotacao').classList.add('open');
  document.body.style.overflow = 'hidden';
}

/* ── Renderizar lista de itens no modal ──────────────────────*/
function renderLista() {
  const lista = document.getElementById('cot-lista');
  lista.innerHTML = '';

  Object.entries(carrinho).forEach(([nome, info]) => {
    const row = document.createElement('div');
    row.className = 'cot-item';
    row.innerHTML = `
      <div class="cot-item-info">
        <span class="cot-item-nome">${nome}</span>
        <span class="cot-item-tag ${info.periodo === 'mensal' ? 'tag-mensal' : 'tag-unico'}">
          ${info.periodo === 'mensal' ? 'mensal' : 'único'}
        </span>
      </div>
      <div class="cot-item-dir">
        <span class="cot-item-preco">MT ${fmt(info.preco)}</span>
        <button class="cot-item-rem" onclick="removerItem('${nome}')" title="Remover">
          <i class="fa fa-times"></i>
        </button>
      </div>
    `;
    lista.appendChild(row);
  });

  /* Actualizar totais */
  const { totalUnico, totalMensal, total } = calcularTotais();
  document.getElementById('cot-sub-unico').textContent  = `MT ${fmt(totalUnico)}`;
  document.getElementById('cot-sub-mensal').textContent =
    totalMensal > 0 ? `MT ${fmt(totalMensal)} /mês` : 'MT 0';
  document.getElementById('cot-total-val').textContent  = `MT ${fmt(total)}`;
}

/* ── Remover item do carrinho ────────────────────────────────*/
function removerItem(nome) {
  /* Desseleccionar card visualmente */
  document.querySelectorAll('.preco-card').forEach(card => {
    const pcNome = card.querySelector('.pc-nome');
    if (pcNome && pcNome.textContent.trim() === nome) {
      card.classList.remove('pc-selecionado');
      const btn = card.querySelector('.pc-btn');
      if (btn) {
        btn.innerHTML = '<i class="fa fa-plus-circle"></i> Adicionar à Cotação';
        btn.classList.remove('btn-selecionado');
      }
    }
  });

  delete carrinho[nome];
  actualizarFAB();

  if (Object.keys(carrinho).length === 0) {
    fecharCotacao();
    return;
  }
  renderLista();
}

/* ── Limpar tudo ─────────────────────────────────────────────*/
function limparTudo() {
  document.querySelectorAll('.pc-selecionado').forEach(card => {
    card.classList.remove('pc-selecionado');
    const btn = card.querySelector('.pc-btn');
    if (btn) {
      btn.innerHTML = '<i class="fa fa-plus-circle"></i> Adicionar à Cotação';
      btn.classList.remove('btn-selecionado');
    }
  });
  carrinho = {};
  actualizarFAB();
  fecharCotacao();
}

/* ── Fechar modal cotação ────────────────────────────────────*/
function fecharCotacao() {
  const el = document.getElementById('modal-cotacao');
  if (el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ── Ir para passo 2 (dados do cliente) ─────────────────────*/
function irParaDados() {
  const { totalUnico, totalMensal, total } = calcularTotais();
  const nServicos = Object.keys(carrinho).length;

  let resumo = `<strong>${nServicos} serviço${nServicos > 1 ? 's' : ''} seleccionado${nServicos > 1 ? 's' : ''}</strong><br>`;
  Object.keys(carrinho).forEach(n => { resumo += `<span>· ${n}</span><br>`; });
  if (totalUnico > 0)  resumo += `<br>Pagamento único: <strong>MT ${fmt(totalUnico)}</strong><br>`;
  if (totalMensal > 0) resumo += `Pagamento mensal: <strong>MT ${fmt(totalMensal)}/mês</strong><br>`;
  resumo += `<br><span class="resumo-total">Total: MT ${fmt(total)}</span>`;

  document.getElementById('cot-resumo-mini').innerHTML = resumo;
  document.getElementById('cot-step-1').style.display = 'none';
  document.getElementById('cot-step-2').style.display = 'block';
  document.getElementById('cot-nome').focus();
}

function voltarStep1() {
  document.getElementById('cot-step-1').style.display = 'block';
  document.getElementById('cot-step-2').style.display = 'none';
}

/* ── Gerar e enviar cotação para o WhatsApp ──────────────────*/
function enviarCotacaoWA() {
  const nome  = document.getElementById('cot-nome').value.trim();
  const email = document.getElementById('cot-email').value.trim();
  const tel   = document.getElementById('cot-tel').value.trim();

  if (!nome) {
    const inp = document.getElementById('cot-nome');
    inp.style.borderColor = '#ef4444';
    inp.focus();
    setTimeout(() => inp.style.borderColor = '', 2000);
    return;
  }

  const { totalUnico, totalMensal, total } = calcularTotais();
  const data = new Date().toLocaleDateString('pt-PT');
  const hora = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  /* Montar mensagem em formato de recibo */
  let msg = '';
  msg += `🏢 *LF REDES & CONSULTORIA, LDA*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *PEDIDO DE COTAÇÃO*\n`;
  msg += `📅 ${data} às ${hora}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `👤 *Cliente:* ${nome}\n`;
  if (email) msg += `📧 *E-mail:* ${email}\n`;
  if (tel)   msg += `📞 *Telefone:* ${tel}\n`;
  msg += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📦 *SERVIÇOS SOLICITADOS:*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  Object.entries(carrinho).forEach(([nome, info], i) => {
    const tag = info.periodo === 'mensal' ? ' /mês' : '';
    msg += `*${i + 1}. ${nome}*\n`;
    msg += `   💰 MT ${fmt(info.preco)}${tag}\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  if (totalUnico  > 0) msg += `💵 *Pagamento único:*  MT ${fmt(totalUnico)}\n`;
  if (totalMensal > 0) msg += `🔄 *Pagamento mensal:* MT ${fmt(totalMensal)}/mês\n`;
  msg += `\n💎 *TOTAL ESTIMADO: MT ${fmt(total)}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `Aguardo a vossa confirmação e disponibilidade. 🙏\n`;
  msg += `_Cotação gerada em lfredeseconsultoria.co.mz_`;

  const url = `https://wa.me/258845698732?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  fecharCotacao();
}

/* ── Fechar modal cotação ao clicar fora ─────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  const mc = document.getElementById('modal-cotacao');
  if (mc) {
    mc.addEventListener('click', function(e) {
      if (e.target === this) fecharCotacao();
    });
  }
});

/* ── Toast de instrução ──────────────────────────────────────*/
function mostrarToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'cot-hint-toast';
  toast.innerHTML = `<i class="fa fa-hand-pointer"></i> ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
