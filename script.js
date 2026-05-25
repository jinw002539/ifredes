/* ============================================================
   LF REDES & CONSULTORIA — script.js
   ============================================================ */

/* ── Menu Hamburger ──────────────────────────────────────────*/
function toggleMenu() {
  const links = document.getElementById('nav-links');
  const burger = document.getElementById('nav-hamburger');
  const backdrop = document.getElementById('nav-backdrop');
  const aberto = links.classList.toggle('open');
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

/* ── Navbar scroll ───────────────────────────────────────────*/
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 30);
});

/* ── Reveal on scroll ────────────────────────────────────────*/
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── Modal simples ───────────────────────────────────────────*/
let _pacote = '', _preco = '';

function abrirModal(pacote, preco) {
  _pacote = pacote; _preco = preco;
  const label = preco ? pacote + ' — ' + preco : pacote;
  document.getElementById('modal-pacote-label').textContent = label;
  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('modal-nome').focus(), 100);
}

function fecharModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modal').addEventListener('click', function (e) {
  if (e.target === this) fecharModal();
});

function irWhatsApp(e) {
  e.preventDefault();
  const nome = document.getElementById('modal-nome').value.trim();
  const email = document.getElementById('modal-email').value.trim();
  if (!nome) { document.getElementById('modal-nome').focus(); return; }
  let msg = 'Olá! Sou *' + nome + '*';
  if (email) msg += ' (' + email + ')';
  msg += ' e tenho interesse no serviço: *' + _pacote + '*';
  if (_preco) msg += ' — *' + _preco + '*';
  msg += '.\n\nPoderia dar-me mais informações?';
  window.open('https://wa.me/258845698732?text=' + encodeURIComponent(msg), '_blank');
  fecharModal();
  document.getElementById('modal-form').reset();
}

/* ── Formulário de contacto ──────────────────────────────────*/
function enviarFormContacto(e) {
  e.preventDefault();
  const form = e.target;
  const nome = form.querySelector('input[type="text"]').value.trim();
  const tel = form.querySelector('input[type="tel"]').value.trim();
  const serv = form.querySelector('select').value;
  let msg = 'Olá! Sou *' + nome + '* (' + tel + ')';
  if (serv) msg += ' e tenho interesse em: *' + serv + '*';
  msg += '.\n\nAgradecia o vosso contacto.';
  window.open('https://wa.me/258845698732?text=' + encodeURIComponent(msg), '_blank');
}

/* ── ESC fecha modais ────────────────────────────────────────*/
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') { fecharModal(); fecharCotacao(); }
});

/* ============================================================
   SISTEMA DE PACOTES
   ============================================================ */

function abrirPacote(id, tabEl) {
  document.querySelectorAll('.pac-tab').forEach(function (t) { t.classList.remove('active'); });
  document.querySelectorAll('.pac-panel').forEach(function (p) { p.classList.remove('active'); });
  if (tabEl) tabEl.classList.add('active');
  const painel = document.getElementById('pac-' + id);
  if (painel) painel.classList.add('active');
}

function irParaPacote(id) {
  document.getElementById('pacotes').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(function () {
    const tab = document.querySelector('.pac-tab[data-pac="' + id + '"]');
    abrirPacote(id, tab);
  }, 450);
}

/* ============================================================
   SISTEMA DE COTAÇÃO
   ============================================================ */

var carrinho = {};

function fmt(n) {
  return Number(n).toLocaleString('pt-PT');
}

function toggleServico(btn) {
  const card = btn.closest('.pac-servico');
  const nome = card.dataset.nome;
  const preco = parseInt(card.dataset.preco);
  const periodo = card.dataset.periodo;
  const pacote = card.dataset.pacote;

  if (carrinho[nome]) {
    delete carrinho[nome];
    card.classList.remove('ps-selecionado');
    btn.innerHTML = '<i class="fa fa-plus"></i> Seleccionar';
    btn.classList.remove('ps-btn-sel');
  } else {
    carrinho[nome] = { preco: preco, periodo: periodo, pacote: pacote };
    card.classList.add('ps-selecionado');
    btn.innerHTML = '<i class="fa fa-check"></i> Adicionado';
    btn.classList.add('ps-btn-sel');
  }

  actualizarFAB();
  var fab = document.getElementById('cot-fab');
  fab.classList.add('cot-fab-pulse');
  setTimeout(function () { fab.classList.remove('cot-fab-pulse'); }, 600);
}

function selecionarTodoPacote(id) {
  var painel = document.getElementById('pac-' + id);
  painel.querySelectorAll('.pac-servico').forEach(function (card) {
    var btn = card.querySelector('.ps-btn');
    if (!carrinho[card.dataset.nome]) toggleServico(btn);
  });
}

function actualizarFAB() {
  var count = Object.keys(carrinho).length;
  var fab = document.getElementById('cot-fab');
  var badge = document.getElementById('cot-badge');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
  fab.classList.toggle('cot-fab-ativo', count > 0);
}

function calcularTotais() {
  var unico = 0, mensal = 0;
  Object.values(carrinho).forEach(function (s) {
    if (s.periodo === 'unico') unico += s.preco;
    if (s.periodo === 'mensal') mensal += s.preco;
  });
  return { unico: unico, mensal: mensal, total: unico + mensal };
}

function abrirCotacao() {
  if (Object.keys(carrinho).length === 0) {
    document.getElementById('pacotes').scrollIntoView({ behavior: 'smooth' });
    mostrarToast('Seleccione os serviços desejados nos pacotes');
    return;
  }
  renderLista();
  document.getElementById('cot-step-1').style.display = 'block';
  document.getElementById('cot-step-2').style.display = 'none';
  document.getElementById('modal-cotacao').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderLista() {
  var lista = document.getElementById('cot-lista');
  lista.innerHTML = '';

  // Agrupar por pacote
  var porPacote = {};
  Object.entries(carrinho).forEach(function (entry) {
    var nome = entry[0], info = entry[1];
    if (!porPacote[info.pacote]) porPacote[info.pacote] = [];
    porPacote[info.pacote].push({ nome: nome, preco: info.preco, periodo: info.periodo });
  });

  Object.entries(porPacote).forEach(function (entry) {
    var pacote = entry[0], servicos = entry[1];
    var grp = document.createElement('div');
    grp.className = 'cot-grupo-header';
    grp.innerHTML = '<i class="fa fa-folder"></i> ' + pacote;
    lista.appendChild(grp);

    servicos.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'cot-item';
      row.innerHTML =
        '<div class="cot-item-info">' +
        '<span class="cot-item-nome">' + s.nome + '</span>' +
        '<span class="cot-item-tag ' + (s.periodo === 'mensal' ? 'tag-mensal' : 'tag-unico') + '">' +
        (s.periodo === 'mensal' ? 'mensal' : 'único') +
        '</span>' +
        '</div>' +
        '<div class="cot-item-dir">' +
        '<span class="cot-item-preco">MT ' + fmt(s.preco) + '</span>' +
        '<button class="cot-item-rem" onclick="removerItem(\'' + s.nome + '\')" title="Remover">' +
        '<i class="fa fa-times"></i>' +
        '</button>' +
        '</div>';
      lista.appendChild(row);
    });
  });

  var t = calcularTotais();
  document.getElementById('cot-sub-unico').textContent = 'MT ' + fmt(t.unico);
  document.getElementById('cot-sub-mensal').textContent = t.mensal > 0 ? 'MT ' + fmt(t.mensal) + ' /mês' : 'MT 0';
  document.getElementById('cot-total-val').textContent = 'MT ' + fmt(t.total);
}

function removerItem(nome) {
  document.querySelectorAll('.pac-servico').forEach(function (card) {
    if (card.dataset.nome === nome) {
      card.classList.remove('ps-selecionado');
      var btn = card.querySelector('.ps-btn');
      if (btn) { btn.innerHTML = '<i class="fa fa-plus"></i> Seleccionar'; btn.classList.remove('ps-btn-sel'); }
    }
  });
  delete carrinho[nome];
  actualizarFAB();
  if (Object.keys(carrinho).length === 0) { fecharCotacao(); return; }
  renderLista();
}

function limparTudo() {
  document.querySelectorAll('.ps-selecionado').forEach(function (card) {
    card.classList.remove('ps-selecionado');
    var btn = card.querySelector('.ps-btn');
    if (btn) { btn.innerHTML = '<i class="fa fa-plus"></i> Seleccionar'; btn.classList.remove('ps-btn-sel'); }
  });
  carrinho = {};
  actualizarFAB();
  fecharCotacao();
}

function fecharCotacao() {
  var el = document.getElementById('modal-cotacao');
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

function irParaDados() {
  var t = calcularTotais();
  var n = Object.keys(carrinho).length;
  var porPacote = {};
  Object.entries(carrinho).forEach(function (entry) {
    var nome = entry[0], info = entry[1];
    if (!porPacote[info.pacote]) porPacote[info.pacote] = [];
    porPacote[info.pacote].push(nome);
  });

  var resumo = '<strong>' + n + ' serviço' + (n > 1 ? 's' : '') + ' seleccionado' + (n > 1 ? 's' : '') + '</strong><br><br>';
  Object.entries(porPacote).forEach(function (entry) {
    resumo += '<span style="font-weight:700;color:var(--azul);">📦 ' + entry[0] + '</span><br>';
    entry[1].forEach(function (s) { resumo += '&nbsp;&nbsp;· ' + s + '<br>'; });
    resumo += '<br>';
  });
  if (t.unico > 0) resumo += 'Único: <strong>MT ' + fmt(t.unico) + '</strong><br>';
  if (t.mensal > 0) resumo += 'Mensal: <strong>MT ' + fmt(t.mensal) + '/mês</strong><br>';
  resumo += '<span class="resumo-total">Total: MT ' + fmt(t.total) + '</span>';

  document.getElementById('cot-resumo-mini').innerHTML = resumo;
  document.getElementById('cot-step-1').style.display = 'none';
  document.getElementById('cot-step-2').style.display = 'block';
  setTimeout(function () { document.getElementById('cot-nome').focus(); }, 100);
}

function voltarStep1() {
  document.getElementById('cot-step-1').style.display = 'block';
  document.getElementById('cot-step-2').style.display = 'none';
}

function enviarCotacaoWA() {
  var nome = document.getElementById('cot-nome').value.trim();
  var email = document.getElementById('cot-email').value.trim();
  var tel = document.getElementById('cot-tel').value.trim();

  if (!nome) {
    var inp = document.getElementById('cot-nome');
    inp.style.borderColor = '#ef4444';
    inp.focus();
    setTimeout(function () { inp.style.borderColor = ''; }, 2000);
    return;
  }

  var t = calcularTotais();
  var data = new Date().toLocaleDateString('pt-PT');
  var hora = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  var porPacote = {};
  Object.entries(carrinho).forEach(function (entry) {
    var n = entry[0], info = entry[1];
    if (!porPacote[info.pacote]) porPacote[info.pacote] = [];
    porPacote[info.pacote].push({ nome: n, preco: info.preco, periodo: info.periodo });
  });

  var msg = '';
  msg += '🏢 *LF REDES & CONSULTORIA, LDA*\n';
  msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  msg += '📋 *PEDIDO DE COTAÇÃO*\n';
  msg += '📅 ' + data + ' às ' + hora + '\n';
  msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  msg += '👤 *Cliente:* ' + nome + '\n';
  if (email) msg += '📧 *E-mail:* ' + email + '\n';
  if (tel) msg += '📞 *Telefone:* ' + tel + '\n';
  msg += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  msg += '📦 *SERVIÇOS POR PACOTE:*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  Object.entries(porPacote).forEach(function (entry) {
    msg += '📁 *' + entry[0] + '*\n';
    entry[1].forEach(function (s, i) {
      var tag = s.periodo === 'mensal' ? ' /mês' : '';
      msg += '   ' + (i + 1) + '. ' + s.nome + ' — MT ' + fmt(s.preco) + tag + '\n';
    });
    msg += '\n';
  });

  msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  if (t.unico > 0) msg += '💵 *Pagamento único:*  MT ' + fmt(t.unico) + '\n';
  if (t.mensal > 0) msg += '🔄 *Pagamento mensal:* MT ' + fmt(t.mensal) + '/mês\n';
  msg += '\n💎 *TOTAL ESTIMADO: MT ' + fmt(t.total) + '*\n';
  msg += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
  msg += 'Aguardo a vossa confirmação. 🙏';

  window.open('https://wa.me/258845698732?text=' + encodeURIComponent(msg), '_blank');
  fecharCotacao();
}

document.addEventListener('DOMContentLoaded', function () {
  var mc = document.getElementById('modal-cotacao');
  if (mc) mc.addEventListener('click', function (e) { if (e.target === this) fecharCotacao(); });
});

function mostrarToast(msg) {
  var t = document.createElement('div');
  t.className = 'cot-hint-toast';
  t.innerHTML = '<i class="fa fa-hand-pointer"></i> ' + msg;
  document.body.appendChild(t);
  setTimeout(function () { t.classList.add('show'); }, 50);
  setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, 3500);
}