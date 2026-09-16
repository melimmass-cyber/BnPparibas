import { assets, usdTotal, deposit, money } from './demo-data.js';
import './portal-polish.css';
const ICONS = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10H5V10Z"/><path d="M9 20v-6h6v6"/></svg>',
  portfolio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 5 6 3v11l-6-3V5Zm10 0 6-3v11l-6 3V5Z"/><path d="m10 8 4-3v11l-4 3V8Z"/></svg>',
  banking: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-5 9 5"/><path d="M5 10h14v2H5zm1 3v6m4-6v6m4-6v6m4-6v6M3 21h18"/></svg>',
  investments: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M5 17l4-5 3 3 6-8"/><path d="M15 7h3v3"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 9 3-5h8l3 5-7 11L5 9Z"/><path d="m5 9 7 3 7-3M8 4l4 8 4-8"/></svg>',
  document: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5M9 13h6m-6 4h6"/></svg>',
  report: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h11l3 3v15H5V3Z"/><path d="M16 3v4h4M8 17v-4m4 4V9m4 8v-6"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 7 8 6 8-6"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c.8-4 3.3-6.1 7.5-6.1s6.7 2.1 7.5 6.1"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .2 1.7-2.1 2.1-1.7-.2-1.1 1.1-.5 1.6H11l-.5-1.6-1.1-1.1-1.7.2-2.1-2.1.2-1.7-1.1-1.1L3.1 13v-3l1.6-.6L5.8 8l-.2-1.7 2.1-2.1 1.7.2 1.1-1.1L11 1.7h3l.5 1.6 1.1 1.1 1.7-.2 2.1 2.1-.2 1.7 1.1 1.1 1.6.6v3l-1.6.6-1.1 1.1Z"/></svg>',
  logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5v16h5M14 8l4 4-4 4m4-4H9"/></svg>',
  globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.4 5.2 3.4 8.5S14.3 18.1 12 20.5C9.7 18.1 8.6 15.3 8.6 12S9.7 5.9 12 3.5Z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 12s3.1-5 8.5-5 8.5 5 8.5 5-3.1 5-8.5 5-8.5-5-8.5-5Z"/><circle cx="12" cy="12" r="2.2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.2 8.4-8 10-4.8-1.6-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
  headset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><path d="M4 13h3v5H5a1 1 0 0 1-1-1v-4Zm16 0h-3v5h2a1 1 0 0 0 1-1v-4ZM17 19c-1 1.3-2.7 2-5 2"/></svg>',
  info: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 10v6m0-9v.1"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
};
const GOLD_IMAGE = new URL('./src/assets/dashboard/gold-bars.png', import.meta.url).href;
const DIAMOND_IMAGE = new URL('./src/assets/dashboard/diamond.png', import.meta.url).href;

const page = document.body.dataset.page || 'dashboard';
const pageConfig = {
  dashboard: { title: 'myWealth | Overview', selected: 'home', defaultView: 'overview' },
  accounts: { title: 'myWealth | Banking', selected: 'banking', defaultView: 'banking' },
  estate: { title: 'myWealth | Estate Hub', selected: 'home', defaultView: 'estate' },
  documents: { title: 'myWealth | Documents', selected: 'documents', defaultView: 'documents' },
  transfers: { title: 'myWealth | Transfers', selected: 'banking', defaultView: 'transfers' },
  settings: { title: 'myWealth | Settings', selected: 'settings', defaultView: 'settings' }
};
const config = pageConfig[page] || pageConfig.dashboard;
const queryView = new URLSearchParams(window.location.search).get('tab');
let currentView = queryView || config.defaultView;

document.title = config.title;

function navLink(key, label, href, icon, badge) {
  const active = config.selected === key ? ' is-active' : '';
  const count = badge ? '<b class="nav-badge">' + badge + '</b>' : '';
  return '<a data-nav="' + key + '" class="nav-link' + active + '" href="' + href + '" aria-current="' + (config.selected === key ? 'page' : 'false') + '">' + icon + '<span>' + label + '</span>' + count + '</a>';
}

function shell() {
  return [
    '<header class="portal-header">',
      '<a class="portal-brand" href="./dashboard.html" aria-label="BNP Paribas Wealth Management dashboard">',
        '<span class="brand-symbol" aria-hidden="true"><img src="./src/assets/bnp-paribas-symbol.jpg" alt=""></span>',
        '<span class="brand-wordmark"><strong>BNP PARIBAS</strong><small>WEALTH MANAGEMENT</small></span>',
      '</a>',
      '<span class="header-divider" aria-hidden="true"></span>',
      '<p class="brand-promise">The bank<br>for a changing world</p>',
      '<button class="mobile-nav-toggle" type="button" data-action="toggle-mobile-nav" aria-expanded="false" aria-controls="primary-navigation" aria-label="Open navigation">' + ICONS.menu + '</button>',
      '<div class="header-tools">',
        '<div class="message-menu"><button class="header-tool" type="button" data-action="messages" aria-label="Open local message drafts">' + ICONS.mail + '</button></div>',
        '<span class="tool-divider" aria-hidden="true"></span>',
        '<div class="language-menu">',
          '<button class="language-toggle" type="button" data-action="toggle-language" aria-expanded="false" aria-controls="language-popover">' + ICONS.globe + '<span>EN</span><svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>',
          '<div class="popover" id="language-popover" role="menu"><button type="button" role="menuitem" data-language="EN">English</button><button type="button" role="menuitem" data-language="FR">Français</button><button type="button" role="menuitem" data-language="DE">Deutsch</button></div>',
        '</div>',
        '<span class="tool-divider" aria-hidden="true"></span>',
        '<div class="profile-menu">',
          '<button class="profile-toggle" type="button" data-action="toggle-profile" aria-expanded="false" aria-controls="profile-popover"><span class="profile-avatar">MC</span><span class="profile-copy"><strong>Mandy Cribley</strong><small>Heir to William Cribley Estate</small></span><svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>',
          '<div class="popover" id="profile-popover" role="menu"><a href="./settings.html" role="menuitem">Profile &amp; preferences</a><a href="./settings.html" role="menuitem">Security settings</a><button type="button" role="menuitem" data-action="logout">Log out</button></div>',
        '</div>',
      '</div>',
    '</header>',
    '<div class="portal-grid">',
      '<aside class="side-nav" id="primary-navigation" aria-label="Primary navigation">',
        '<p class="mywealth-mark">myWealth</p>',
        '<nav class="nav-list">',
          navLink('home', 'Home', './dashboard.html', ICONS.home),
          navLink('portfolio', 'Portfolio Overview', './dashboard.html?tab=overview', ICONS.portfolio),
          navLink('banking', 'Banking', './accounts.html', ICONS.banking),
          navLink('transfers', 'Transfers', './transfers.html', ICONS.logout),
          navLink('estate', 'Estate Hub', './estate-hub.html', ICONS.home),
          navLink('investments', 'Real Estate', './dashboard.html?tab=real-assets', ICONS.investments),
          navLink('precious', 'Precious Assets', './dashboard.html?tab=precious', ICONS.diamond),
          navLink('documents', 'Documents', './documents.html', ICONS.document),
          navLink('reports', 'Reports', './documents.html?tab=reports', ICONS.report),
          navLink('messages', 'Messages', './dashboard.html?tab=messages', ICONS.mail),
        '</nav>',
        '<nav class="side-nav-bottom" aria-label="Account navigation">',
          navLink('profile', 'Profile', './settings.html', ICONS.user),
          navLink('settings', 'Settings', './settings.html', ICONS.settings),
          navLink('logout', 'Log out', './mywealth.html', ICONS.logout),
        '</nav>',
      '</aside>',
      '<button class="portal-scrim" id="portal-scrim" type="button" data-action="close-mobile-nav" aria-label="Close navigation" hidden></button>',
      '<main class="portal-main">',
        '<section class="account-hero" aria-labelledby="account-welcome">',
          '<div class="account-hero-inner">',
            '<div class="welcome-copy"><p class="portfolio-eyebrow">YOUR WEALTH AT A GLANCE</p><h1 id="account-welcome">Portfolio overview</h1><p>William Cribley Estate · Mandy Cribley<br></p></div>',
            '<section class="wealth-card" aria-label="Estimated total wealth">',
              '<div><div class="wealth-card-label">USD asset portfolio ' + ICONS.eye + '</div><p class="wealth-value" data-sensitive>' + money(usdTotal) + '</p><p class="wealth-change">Gold · Gemstones · Real estate</p></div>',
              '<div class="valuation-date"><p>Valuation basis</p><span></span><small>EUR deposit shown separately</small></div>',
            '</section>',
          '</div>',
        '</section>',
        '<nav class="section-tabs" aria-label="Wealth categories">',
          tab('overview', 'Overview'), tab('financial', 'Financial Assets'), tab('real-assets', 'Real Assets'), tab('precious', 'Precious Assets'), tab('private-equity', 'Private Equity'), tab('reports', 'Reports'),
        '</nav>',
        '<section class="content-wrap" id="page-content" aria-live="polite"></section>',
      '</main>',
    '</div>',
    '<dialog class="modal" id="portal-modal" aria-labelledby="modal-title"><div class="modal-content"><button class="modal-close" type="button" data-action="close-modal" aria-label="Close">×</button><h2 id="modal-title"></h2><p id="modal-copy"></p><ul class="modal-list" id="modal-list"></ul><div class="modal-actions"><button class="outline-button" type="button" data-action="close-modal">Close</button><button class="solid-button" type="button" data-action="modal-confirm">Continue</button></div></div></dialog>',
    '<div class="toast" id="portal-toast" role="status" aria-live="polite"></div>'
  ].join('');
}

function tab(id, label) {
  return '<button type="button" class="section-tab" data-tab="' + id + '" aria-selected="false">' + label + '</button>';
}

function titleBlock(title, description, controls) {
  return '<div class="page-heading"><div><h2>' + title + '</h2><p>' + description + '</p></div>' + (controls || '') + '</div>';
}


const storageKey = 'wealth-demo-workspace-v2';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let workspace;
try { workspace = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { workspace = {}; }
if (!workspace || typeof workspace !== 'object' || Array.isArray(workspace)) workspace = {};
workspace.messages = Array.isArray(workspace.messages) ? workspace.messages.filter(x => x && typeof x === 'object').slice(0, 50) : [];
workspace.transfers = Array.isArray(workspace.transfers) ? workspace.transfers.filter(x => x && typeof x === 'object').slice(0, 50) : [];
workspace.hideAmounts = workspace.hideAmounts === true;
workspace.compact = workspace.compact === true;
workspace.language = ['EN','FR','DE'].includes(workspace.language) ? workspace.language : 'EN';
let assetSearch = '', assetSort = 'value-desc';
const titles = { overview:'Portfolio Overview', financial:'Financial Assets', 'real-assets':'Real Estate', precious:'Precious Assets', 'private-equity':'Private Equity', reports:'Reports', banking:'Banking', estate:'Estate Hub', documents:'Document Centre', transfers:'Transfer Drafts', settings:'Settings', messages:'Messages' };

function saveWorkspace() {
  try { localStorage.setItem(storageKey, JSON.stringify(workspace)); return true; }
  catch { toast('Your browser could not save this change. Storage may be full or unavailable.'); return false; }
}
function stat(label, value, detail, sensitive = true) {
  return '<article class="summary-card"><small>' + label + '</small><strong' + (sensitive ? ' data-sensitive' : '') + '>' + value + '</strong><b>' + detail + '</b></article>';
}
function panel(title, body, action = '') {
  return '<section class="data-panel"><div class="data-panel-header"><h3>' + title + '</h3>' + action + '</div>' + body + '</section>';
}
function empty(title, text) {
  return '<div class="polished-empty"><span aria-hidden="true">◇</span><h3>' + title + '</h3><p>' + text + '</p></div>';
}
function insightRail() {
  const bars = assets.map(a => '<div class="allocation-row"><div><span>' + a.name + '</span><b>' + (a.value / usdTotal * 100).toFixed(1) + '%</b></div><progress aria-label="' + a.name + ' allocation" value="' + a.value + '" max="' + usdTotal + '"></progress></div>').join('');
  return '<aside class="insight-rail">' + panel('USD allocation', bars + '<p class="panel-note">Share of the Estate USD portfolio. The EUR deposit is excluded.</p>') + panel('Your workspace', '<p class="panel-note">Keep Estae notes and explore portfolio reports. Drafts will be saved in your account.</p><button class="outline-button" data-action="messages">Open messages</button>') + '</aside>';
}
function holdingTable(view) {
  let filtered = assets.filter(a => view === 'precious' ? a.category === 'Precious assets' : view === 'real-assets' ? a.id === 'property' : true);
  filtered = filtered.filter(a => (a.name + ' ' + a.category).toLowerCase().includes(assetSearch.toLowerCase()));
  filtered.sort((a,b) => assetSort === 'name' ? a.name.localeCompare(b.name) : assetSort === 'value-asc' ? a.value - b.value : b.value - a.value);
  if (!filtered.length) return empty('No matching assets', 'Try a different asset name or clear your search.');
  return '<div class="table-scroll"><table class="portfolio-table"><thead><tr><th scope="col">Holding</th><th scope="col">Quantity</th><th scope="col">Estate valuation · USD</th><th scope="col">Allocation</th><th scope="col"><span class="sr-only">Details</span></th></tr></thead><tbody>' + filtered.map(a => '<tr><td><span class="holding-name">' + a.name + '</span><small>' + a.category + '</small></td><td>' + (a.quantity === null ? 'Property portfolio' : a.quantity + ' ' + a.unit) + '</td><td><strong data-sensitive>' + (a.approximate ? '≈ ' : '') + money(a.value) + '</strong></td><td>' + (a.value / usdTotal * 100).toFixed(1) + '%</td><td><button class="small-button" data-action="asset" data-id="' + a.id + '">Details</button></td></tr>').join('') + '</tbody></table></div>';
}
function holdings(view = 'overview') {
  return panel('Asset register', '<div class="filter-bar"><label>Search holdings<input id="asset-search" type="search" placeholder="Search by asset or category" value="' + escapeHtml(assetSearch) + '"></label><label>Sort by<select id="asset-sort"><option value="value-desc"' + (assetSort === 'value-desc' ? ' selected' : '') + '>Value: high to low</option><option value="value-asc"' + (assetSort === 'value-asc' ? ' selected' : '') + '>Value: low to high</option><option value="name"' + (assetSort === 'name' ? ' selected' : '') + '>Asset name</option></select></label></div><div id="holdings-results">' + holdingTable(view) + '</div>', '<button class="outline-button" data-action="download">Export CSV</button>');
}
function overviewView() {
  return '<div class="dashboard-summary">' + stat('USD portfolio', money(usdTotal), '3 asset positions') + stat('Precious assets', money(assets.filter(a => a.category === 'Precious assets').reduce((sum,a) => sum + a.value, 0)), '50 kg gold · 60 kg gemstones') + stat('Real estate', '≈ ' + money(assets.find(a => a.id === 'property').value), 'Property estimate') + '</div>' + holdings();
}
function preciousView() {
  return '<div class="asset-stat-grid">' + assets.filter(a => a.category === 'Precious assets').map(a => '<button class="asset-stat" data-action="asset" data-id="' + a.id + '"><span class="asset-product-image"><img src="' + (a.id === 'gold' ? GOLD_IMAGE : DIAMOND_IMAGE) + '" alt="' + a.name + ' illustration"></span><span><span class="asset-stat-label">' + a.name + '</span><strong class="asset-stat-value">' + a.quantity + ' kg</strong><small class="asset-stat-detail" data-sensitive>' + money(a.value) + ' · Estate valuation</small></span><span aria-hidden="true">↗</span></button>').join('') + '</div>' + holdings('precious') + panel('Valuation notes', '<p class="panel-note">These are the values supplied for this Estate. Gemstone type, quality, certifications and property details have been specified. Live price feed or custody verification is implied.</p>');
}
function realAssetsView() {
  return '<div class="property-feature"><div><p class="portfolio-eyebrow">REAL ESTATE · HOLDINGS</p><h3>Room for a broader perspective.</h3><p>One place to review the property allocation alongside your other assets.</p><strong data-sensitive>≈ ' + money(assets.find(a => a.id === 'property').value) + '</strong><button class="outline-button" data-action="asset" data-id="property">View property summary</button></div><div class="property-art" aria-hidden="true"><i></i><i></i><i></i></div></div>' + holdings('real-assets');
}
function financialView() {
  return '<div class="dashboard-summary">' + stat('Fixed deposit · EUR', money(deposit.value,'EUR'), 'Existing deposit') + stat('Available funds · EUR', money(deposit.available,'EUR'), 'Estate restricted account') + stat('Currency', 'EUR', 'Separate from USD asset valuations', false) + '</div>' + panel('Deposit details', '<dl class="detail-definition"><dt>Account type</dt><dd>Estate fixed deposit</dd><dt>Account holder</dt><dd>William Cribley Estate</dd><dt>Recorded heir</dt><dd>Mandy Cribley</dd><dt>Access</dt><dd>No withdrawal or payment capability</dd></dl>', '<a class="outline-button" href="./accounts.html">Open Banking</a>');
}
function bankingView() {
  return financialView() + panel('Activity', empty('No connected transactions', 'No bank feed is connected. Sample transfer drafts are listed separately and never change account balances.'), '<a class="outline-button" href="./transfers.html">Manage local drafts</a>');
}
const reports = [{ id:'portfolio', title:'Portfolio summary', description:'Gold, gemstones and real estate · USD' }, { id:'deposit', title:'Deposit summary', description:'Sample fixed deposit · EUR' }];
function documentsView() {
  return panel('Available  reports', '<div class="report-list">' + reports.map(r => '<article><span class="report-icon">' + ICONS.document + '</span><div><h4>' + r.title + '</h4><p>' + r.description + '</p><small>Official statement</small></div><button class="small-button" data-action="report" data-id="' + r.id + '">Preview</button><button class="outline-button" data-action="download" data-id="' + r.id + '">CSV</button></article>').join('') + '</div>') + panel('Document storage', empty('Official statements and uploaded documents will require an authorized document service.'));
}
function reportsView() { return documentsView(); }
function estateView() {
  return overviewView() + panel('Estate record', '<dl class="detail-definition"><dt>Sample estate</dt><dd>William Cribley</dd><dt>Sample heir</dt><dd>Mandy Cribley</dd><dt>USD assets</dt><dd data-sensitive>' + money(usdTotal) + '</dd><dt>Separate EUR deposit</dt><dd data-sensitive>' + money(deposit.value,'EUR') + '</dd><dt>Record status</dt><dd>Illustrative only · No legal or custody verification</dd></dl>');
}
function privateEquityView() { return panel('Private investments', empty('No sample positions added', 'The current portfolio contains gold, gemstones and real estate. No private-equity values have been assumed.')); }
function transfersView() {
  return panel('Prepare a local transfer draft', '<p class="panel-note">Preview the form with sample details. Nothing is submitted, no money moves, and no balance is changed. Do not enter real bank details.</p><form id="transfer-form" class="workspace-form"><label>Sample recipient<input name="recipient" maxlength="80" placeholder="Sample recipient" required></label><label>Currency<select name="currency"><option>USD</option><option>EUR</option></select></label><label>Amount<input name="amount" inputmode="decimal" pattern="[0-9]+([.][0-9]{1,2})?" maxlength="12" placeholder="0.00" required></label><label>Reference<input name="reference" maxlength="120" placeholder="Demo reference"></label><button class="solid-button" type="submit">Save local draft</button></form>') + panel('Local drafts', workspace.transfers.length ? '<ul class="simple-list">' + workspace.transfers.map(d => '<li><span><strong>' + escapeHtml(d.recipient) + '</strong><small>' + escapeHtml(d.reference || 'No reference') + ' · Draft only</small></span><strong data-sensitive>' + escapeHtml(new Intl.NumberFormat('en-US', {style:'currency', currency:['USD','EUR'].includes(d.currency) ? d.currency : 'USD', minimumFractionDigits:2, maximumFractionDigits:2}).format(Number(d.amount))) + '</strong><button class="small-button" data-action="delete-transfer" data-id="' + escapeHtml(d.id) + '">Delete draft</button></li>').join('') + '</ul>' : empty('No local drafts', 'Saved previews will appear here. These are not pending bank transfers.'));
}
function messagesView() {
  return panel('Your personal message notebook', '<p class="panel-note">Save Estate notes. This is connected to our sending service. Avoid personal or sensitive information.</p><form id="message-form" class="workspace-form"><label class="full-width">Subject<input name="subject" maxlength="100" required></label><label class="full-width">Message<textarea name="message" rows="4" maxlength="4000" required></textarea></label><button class="solid-button" type="submit">Save note</button></form>') + panel('Saved notes', workspace.messages.length ? '<div class="note-list">' + workspace.messages.map(m => '<article><h4>' + escapeHtml(m.subject) + '</h4><p>' + escapeHtml(m.message) + '</p><button class="small-button" data-action="delete-message" data-id="' + escapeHtml(m.id) + '">Delete note</button></article>').join('') + '</div>' : empty('Your notebook is empty', 'Note sent.'));
}
function settingsView() {
  return panel('Display preferences', '<form id="settings-form" class="workspace-form"><label class="full-width checkbox-field"><input type="checkbox" name="hide"' + (workspace.hideAmounts ? ' checked' : '') + '> Hide amounts on screen</label><label class="full-width checkbox-field"><input type="checkbox" name="compact"' + (workspace.compact ? ' checked' : '') + '> Use compact spacing</label><label>Preferred language<select name="language">' + ['EN','FR','DE'].map(l => '<option' + (workspace.language === l ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></label><button class="solid-button" type="submit">Save preferences</button></form>') + panel('Security & privacy');
}
function applyPreferences() {
  document.body.classList.toggle('compact-workspace', workspace.compact);
  document.querySelectorAll('[data-sensitive]').forEach(node => {
    if (!node.dataset.visibleValue) node.dataset.visibleValue = node.textContent;
    node.textContent = workspace.hideAmounts ? '••••••' : node.dataset.visibleValue;
  });
  document.querySelector('.language-toggle span').textContent = workspace.language;
}
function renderView(view) {
  const views = { overview:overviewView, financial:financialView, 'real-assets':realAssetsView, precious:preciousView, 'private-equity':privateEquityView, reports:reportsView, banking:bankingView, estate:estateView, documents:documentsView, transfers:transfersView, settings:settingsView, messages:messagesView };
  currentView = Object.hasOwn(views,view) ? view : 'overview';
  document.title = 'myWealth | ' + titles[currentView] + ' · Demo';
  const heading = titleBlock(titles[currentView], 'Your Estate wealth. All records are as shown in your account.', '<button class="outline-button" data-action="mask">' + (workspace.hideAmounts ? 'Show amounts' : 'Hide amounts') + '</button>');
  document.getElementById('page-content').innerHTML = heading + '<div class="content-layout"><div class="content-primary">' + views[currentView]() + '</div>' + insightRail() + '</div>';
  document.querySelectorAll('[data-tab]').forEach(button => { const active = button.dataset.tab === currentView; button.classList.toggle('is-active',active); button.setAttribute('aria-selected',String(active)); });
  const navKey = { overview:'home', financial:'banking', 'real-assets':'investments', precious:'precious', 'private-equity':'investments', reports:'reports', banking:'banking', estate:'estate', documents:'documents', transfers:'transfers', settings:'settings', messages:'messages' }[currentView];
  document.querySelectorAll('[data-nav]').forEach(link => { const active = link.dataset.nav === navKey; link.classList.toggle('is-active',active); link.setAttribute('aria-current',active ? 'page' : 'false'); });
  applyPreferences();
}
function navigate(view) {
  renderView(view); closeMobileNavigation();
  history.replaceState({}, '', location.pathname + '?tab=' + encodeURIComponent(currentView));
}
function downloadReport(kind) {
  const reportKind = kind === 'deposit' ? 'deposit' : 'portfolio';
  const link = document.createElement('a');
  link.href = '/demo-export/' + reportKind + '.csv';
  link.download = 'DEMO-' + reportKind + '-summary.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  toast('CSV export requested.');
}
function initializePortal() {
  document.getElementById('wealth-shell-root').innerHTML = shell(); renderView(currentView); syncMobileNavigation(false);
  document.addEventListener('input', event => { if (event.target.id === 'asset-search') { assetSearch = event.target.value; document.getElementById('holdings-results').innerHTML = holdingTable(currentView); applyPreferences(); } });
  document.addEventListener('change', event => { if (event.target.id === 'asset-sort') { assetSort = event.target.value; document.getElementById('holdings-results').innerHTML = holdingTable(currentView); applyPreferences(); } });
  document.addEventListener('click', event => {
    const tab = event.target.closest('[data-tab]'); if (tab) return navigate(tab.dataset.tab);
    const language = event.target.closest('[data-language]'); if (language) { workspace.language = language.dataset.language; if(saveWorkspace()) { applyPreferences(); closePopovers(); toast('Language preference updated.'); } return; }
    const control = event.target.closest('[data-action]'); if (!control) { if(!event.target.closest('.popover')) closePopovers(); return; }
    const action = control.dataset.action;
    if (action === 'toggle-mobile-nav') return toggleMobileNavigation();
    if (action === 'close-mobile-nav') return closeMobileNavigation();
    if (action === 'toggle-language' || action === 'toggle-profile') { const popover = document.getElementById(action === 'toggle-language' ? 'language-popover' : 'profile-popover'); const open = !popover.classList.contains('is-open'); closePopovers(); popover.classList.toggle('is-open',open); control.setAttribute('aria-expanded',String(open)); return; }
    if (action === 'close-modal' || action === 'modal-confirm') return document.getElementById('portal-modal').close();
    if (action === 'logout') return location.assign('./mywealth.html');
    if (action === 'messages') return navigate('messages');
    if (action === 'mask') { workspace.hideAmounts = !workspace.hideAmounts; if(saveWorkspace()) { applyPreferences(); control.textContent = workspace.hideAmounts ? 'Show amounts' : 'Hide amounts'; } return; }
    if (action === 'asset') { const a = assets.find(a => a.id === control.dataset.id); if(a) modal(a.name + ' · Holding', 'Verified asset position recorded under estate administration. Custody and valuation confirmed by designated fiduciary registry.', [['Quantity',a.quantity === null ? 'Property portfolio; details unspecified' : a.quantity + ' kg'],['USD valuation',workspace.hideAmounts ? 'Hidden by display preference' : (a.approximate ? 'Approximately ' : '') + money(a.value)],['Share of USD portfolio',(a.value/usdTotal*100).toFixed(1)+'%']]); return; }
    if (action === 'download') return downloadReport(control.dataset.id);
    if (action === 'report') { modal('DEMO · ' + (control.dataset.id === 'deposit' ? 'Deposit summary' : 'Portfolio summary'), 'Preview only. Download CSV for an explicitly labeled sample report.', control.dataset.id === 'deposit' ? [['Currency','EUR'],['Sample fixed deposit',workspace.hideAmounts ? 'Hidden' : money(deposit.value,'EUR')]] : assets.map(a => [a.name,workspace.hideAmounts ? 'Hidden' : (a.quantity === null ? 'Approx. ' : a.quantity + ' kg · ') + money(a.value)])); return; }
    if (action === 'delete-message' || action === 'delete-transfer') { const key = action === 'delete-message' ? 'messages' : 'transfers'; const previous = workspace[key]; workspace[key] = previous.filter(x => x.id !== control.dataset.id); if(saveWorkspace()) { renderView(currentView); toast('Local draft deleted.'); } else workspace[key] = previous; }
  });
  document.addEventListener('submit', event => {
    if (!['settings-form','message-form','transfer-form'].includes(event.target.id)) return;
    event.preventDefault(); const data = new FormData(event.target);
    if(event.target.id === 'settings-form') { workspace.hideAmounts = data.get('hide') === 'on'; workspace.compact = data.get('compact') === 'on'; workspace.language = String(data.get('language')); if(saveWorkspace()) { renderView(currentView); toast('Display preferences saved.'); } return; }
    if(event.target.id === 'message-form') { const subject = String(data.get('subject')).trim(), message = String(data.get('message')).trim(); if(!subject || !message) return toast('Enter a subject and a message.'); if(workspace.messages.length >= 50) return toast('You have 50 notes. Delete an older note first.'); workspace.messages.unshift({id:crypto.randomUUID(),subject:subject.slice(0,100),message:message.slice(0,4000)}); if(saveWorkspace()) { renderView('messages'); toast('Note saved locally. Nothing was sent.'); } else workspace.messages.shift(); return; }
    const amountText = String(data.get('amount')), amount = Number(amountText), recipient = String(data.get('recipient')).trim();
    if(!/^[0-9]+([.][0-9]{1,2})?$/.test(amountText) || !Number.isFinite(amount) || amount <= 0 || amount > 100000000 || !recipient) return toast('Enter a sample recipient and an amount between 0.01 and 100,000,000 with up to two decimals.');
    if(workspace.transfers.length >= 50) return toast('You have 50 drafts. Delete an older draft first.');
    workspace.transfers.unshift({id:crypto.randomUUID(),recipient:recipient.slice(0,80),amount:amountText,currency:data.get('currency'),reference:String(data.get('reference')).trim().slice(0,120)});
    if(saveWorkspace()) { renderView('transfers'); toast('Draft saved locally. No payment was submitted.'); } else workspace.transfers.shift();
  });
  document.getElementById('portal-modal').addEventListener('click', event => { if(event.target === event.currentTarget) event.currentTarget.close(); });
  window.addEventListener('resize',closeMobileNavigation);
  window.addEventListener('popstate',() => renderView(new URLSearchParams(location.search).get('tab') || config.defaultView));
  document.addEventListener('keydown',event => { if(event.key === 'Escape') { closeMobileNavigation(); closePopovers(); } });
}

function modal(title, copy, items, confirmLabel) {
  const dialog = document.getElementById('portal-modal');
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-copy').textContent = copy;
  document.getElementById('modal-list').innerHTML = (items || []).map(function(item) {
    return '<li><span>' + item[0] + '</span><strong>' + item[1] + '</strong></li>';
  }).join('');
  const confirm = dialog.querySelector('[data-action="modal-confirm"]');
  confirm.textContent = confirmLabel || 'Continue';
  confirm.hidden = !confirmLabel;
  if (!dialog.open) dialog.showModal();
}

function toast(message) {
  const node = document.getElementById('portal-toast');
  node.textContent = message;
  node.classList.add('is-visible');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(function() { node.classList.remove('is-visible'); }, 3800);
}

function closePopovers() {
  document.querySelectorAll('.popover.is-open').forEach(function(node) { node.classList.remove('is-open'); });
  document.querySelectorAll('.language-toggle[aria-expanded="true"], .profile-toggle[aria-expanded="true"], .header-tool[aria-expanded="true"]').forEach(function(node) { node.setAttribute('aria-expanded', 'false'); });
}

function syncMobileNavigation(open) {
  const nav = document.getElementById('primary-navigation');
  const toggle = document.querySelector('[data-action="toggle-mobile-nav"]');
  const scrim = document.getElementById('portal-scrim');
  const isMobile = window.matchMedia('(max-width: 820px)').matches;
  const shouldOpen = isMobile && Boolean(open);
  if (!nav || !toggle || !scrim) return;

  nav.classList.toggle('is-mobile-open', shouldOpen);
  scrim.hidden = !shouldOpen;
  toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
  toggle.setAttribute('aria-label', shouldOpen ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('mobile-navigation-open', shouldOpen);

  if (isMobile && !shouldOpen) {
    nav.setAttribute('aria-hidden', 'true');
    if ('inert' in nav) nav.inert = true;
  } else {
    nav.removeAttribute('aria-hidden');
    if ('inert' in nav) nav.inert = false;
  }
}

function toggleMobileNavigation() {
  const nav = document.getElementById('primary-navigation');
  syncMobileNavigation(!(nav && nav.classList.contains('is-mobile-open')));
}

function closeMobileNavigation() {
  syncMobileNavigation(false);
}


initializePortal();



