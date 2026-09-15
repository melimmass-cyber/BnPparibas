import { assets, usdTotal, money as formatMoney } from './demo-data.js';
import { initEstateProgress } from './estate-progress.js';
const icons = {
  wallet: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12v3"/><path d="M16 14h3"/></svg>',
  document: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5M9 13h6m-6 4h6"/></svg>',
  chart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h16M6 17l4-5 3 3 5-8"/><path d="M15 7h3v3"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v2"/></svg>'
};

function money(whole, decimal) {
  return '<span class="financial-amount" aria-label="' + whole + ' euros"><span class="money-sign" aria-hidden="true">€</span><span class="money-major" aria-hidden="true">' + whole + '</span><span class="money-decimal" aria-hidden="true">.' + (decimal || '00') + '</span></span>';
}

function app() {
  return [
    '<header class="estate-topbar">',
      '<a class="estate-back" href="./dashboard.html?tab=overview" aria-label="Back to myWealth"><span aria-hidden="true">←</span><span>Back to myWealth</span></a>',
      '<a class="estate-brand" href="./dashboard.html" aria-label="Return to estate overview"><span class="estate-mark">E</span><span><strong>Estate Account Record</strong><small>Heir access</small></span></a>',
      '<div class="record-person"><span class="record-avatar">MC</span><span><strong>Mandy Cribley</strong><small>Recorded heir to William Cribley Estate</small></span></div>',
    '</header>',
    '<main class="record-body">',
      '<section class="estate-hero" aria-labelledby="estate-account-title">',
        '<div><div class="record-eyebrow">Heir banking</div><h1 id="estate-account-title">Estate of William Cribley</h1><p>Your estate account overview, supporting records and inheritance progress in one place.</p><p class="hero-reference">Estate record EST-3500 · Recorded heir: Mandy Cribley</p></div>',
        '<section class="balance-card" aria-label="Frozen fixed deposit balance"><small>Fixed deposit</small><strong>' + money('3,500,000') + '</strong><div><span>Available funds</span><b>€ 0.00 · Frozen</b></div></section>',
      '</section>',
      '<section class="status-banner" aria-label="Estate account status">' + icons.lock + '<div><strong>Estate account restricted</strong><span> :This account is currently under a legal hold following the passing of the account holder. In accordance with banking regulations, funds are temporarily unavailable for transfer, withdrawal, or general usage. Full disbursement of the account balance is subject to the submission of finalized court ownership proceedings (Probate or Letters of Administration).</span></div></section>',
      '<section class="assets-section" aria-labelledby="documented-assets-title">',
        '<div class="section-heading"><div><h2 id="documented-assets-title">Estate Asset Overview</h2><p>Your Estate portfolio, with quantities and currency shown clearly.</p></div></div>',
        '<div class="asset-grid">',
          assets.map(a => '<article class="asset-cell"><small>' + a.name + '</small><strong>' + formatMoney(a.value) + '</strong><span>' + (a.quantity ? a.quantity + ' ' + a.unit : 'Approximate valuation') + ' · USD value</span></article>').join(''),
          '<article class="asset-cell total"><small>Total USD assets</small><strong>' + formatMoney(usdTotal) + '</strong><span></span></article>',
        '</div>',
      '</section>',
      '<section class="estate-actions" aria-label="Estate record actions">',
        '<button class="secondary-button" type="button" data-action="overview">' + icons.chart + 'Open myWealth portfolio</button>',
      '</section>',
      '<div class="account-layout">',
        '<section class="panel" aria-labelledby="deposit-record-title">',
          '<div class="panel-header"><div><h2 id="deposit-record-title">Fixed Deposit Record</h2><p>Recorded account balance and administration status</p></div><button class="link-button" type="button" data-action="details">View record details</button></div>',
          '<div class="account-list"><article class="account-record"><span class="account-record-icon">' + icons.wallet + '</span><div><h3>Estate Fixed Deposit</h3><p>Reference: FD •••• 3500 · Estate administration record</p></div><div><div class="account-value">' + money('3,500,000') + '</div><span class="frozen-label">Frozen estate account</span></div></article></div>',
          '<p class="estate-note"><strong>Administration restriction:</strong> this recorded deposit is not available for payments or transfers through this private estate view.</p>',
        '</section>',
        '<aside class="panel" aria-labelledby="estate-record-title">',
          '<div class="panel-header"><div><h2 id="estate-record-title">Record Particulars</h2><p>Sample account information</p></div></div>',
          '<ul class="record-list"><li><span><strong>Recorded deposit</strong><small>Illustrative fixed-deposit amount</small></span><b>' + money('3,500,000') + '</b></li><li><span><strong>Administration status</strong><small>Payment and transfer restriction</small></span><b class="restricted">Frozen</b></li><li><span><strong>Testator</strong><small>Estate record</small></span><b>William Cribley</b></li><li><span><strong>Recorded heir</strong><small>View-only record access</small></span><b>Mandy Cribley</b></li></ul>',
          '<div class="estate-support"><button class="secondary-button" type="button" data-action="support">Help with this record</button></div>',
        '</aside>',
      '</div>',
      '<section class="record-detail-grid" aria-label="Estate documentation details">',
        '<article class="detail-panel"><h2>Estate Parties</h2><p>Roles recorded for this private estate view.</p><dl class="detail-list"><div><dt>Testator</dt><dd>William Cribley</dd></div><div><dt>Recorded heir</dt><dd>Mandy Cribley</dd></div><div><dt>Record access</dt><dd>View-only</dd></div></dl></article>',
        '<article class="detail-panel"><h2>Portfolio Particulars</h2><p>Holdings linked to this estate.</p><dl class="detail-list">' + assets.map(a => '<div><dt>' + a.name + (a.quantity ? ' · ' + a.quantity + ' ' + a.unit : '') + '</dt><dd>' + (a.approximate ? 'Approx. ' : '') + formatMoney(a.value) + ' USD</dd></div>').join('') + '</dl><div class="detail-provenance"><strong>LEGAL HOLD ACTIVE</strong><span>Custody, ownership and valuations are still in verification process.</span></div></article>',
      '</section>',
      '<section class="estate-review-grid" aria-label="Estate review and documents">',
        '<article class="review-panel" id="inheritance-progress"></article>',
        '<article class="review-panel"><h2>Documents to Prepare</h2><p>Illustrative preparation list. The estate representative determines the actual requirements.</p><ul class="document-checklist"><li>Official death certificate</li><li>Valid proof of identity for the recorded heir</li><li>Will, probate, or other estate-authority document</li></ul><div class="local-document-prep"><label class="file-picker">Select documents locally<input id="estate-document-input" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"></label><p class="selected-documents" id="selected-documents"></p></div></article>',
        '<article class="review-panel review-support"><div class="review-support-copy">' + icons.document + '<div><h2>Estate Support Request</h2><p>Prepare a private request for an authorised estate representative. This local record does not transmit documents or messages.</p></div></div><button class="primary-button" type="button" data-action="support">Prepare support request</button></article>',
      '</section>',
      '<footer class="record-footer"><span>© 2026 Private Wealth Administration. All rights reserved.</span><button type="button" data-action="support">Estate record support</button></footer>',
    '</main>',
    '<dialog class="estate-dialog" id="estate-dialog"><section><button class="dialog-close" type="button" data-action="close" aria-label="Close">×</button><h2 id="dialog-title"></h2><p id="dialog-copy"></p><div class="dialog-actions"><button class="secondary-button" type="button" data-action="close">Close</button></div></section></dialog>',
    '<dialog class="estate-dialog" id="estate-support-dialog"><form class="estate-support-form" id="estate-support-form"><button class="dialog-close" type="button" data-action="close" aria-label="Close">×</button><h2>Estate Support Request</h2><p>Prepare a request to share through the authorised estate process.</p><label class="support-field"><span>Request type</span><select id="support-subject"><option>Request guidance on the estate record</option><option>Request document-review guidance</option><option>Request fixed-deposit information</option></select></label><label class="support-field"><span>Message</span><textarea id="support-message" required maxlength="3000" placeholder="Describe the help you need with this estate record."></textarea></label><p class="draft-notice">Download a text draft to share yourself. Nothing is sent to a representative.</p><div class="dialog-actions"><button class="secondary-button" type="button" data-action="close">Cancel</button><button class="primary-button" type="submit">Download request draft</button></div></form></dialog>'
  ].join('');
}

function openDialog(title, copy) {
  document.getElementById('dialog-title').textContent = title;
  document.getElementById('dialog-copy').textContent = copy;
  const dialog = document.getElementById('estate-dialog');
  if (!dialog.open) dialog.showModal();
}

function prepareSupportRequest() {
  const body = 'ESTATE SUPPORT DRAFT — NOT SENT\n' + document.getElementById('support-subject').value + '\n\n' + document.getElementById('support-message').value;
  const url = URL.createObjectURL(new Blob([body], {type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a'); link.href=url; link.download='estate-request.txt'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.getElementById('estate-support-dialog').close();
  openDialog('Support request prepared', 'A text draft download has been requested. You can share it yourself; this website has not sent it to anyone.');
}

document.getElementById('estate-account-root').innerHTML = app();
initEstateProgress();
document.addEventListener('click', function(event) {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  if (action === 'close') control.closest('dialog').close();
  if (action === 'overview') window.location.assign('./dashboard.html');
  if (action === 'details') openDialog('Documented estate assets', 'Sample assets total $14,200,000 USD: 50 kg gold ($7,000,000), 60 kg gemstones ($5,000,000) and real estate (approximately $2,200,000). The €3,500,000 EUR deposit is separate. Available funds remain €0. These are not verified account records.');
  if (action === 'support') document.getElementById('estate-support-dialog').showModal();
});
document.getElementById('estate-dialog').addEventListener('click', function(event) {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
document.getElementById('estate-support-dialog').addEventListener('click', function(event) {
  if (event.target === event.currentTarget) event.currentTarget.close();
});
document.getElementById('estate-support-form').addEventListener('submit', function(event) {
  event.preventDefault();
  prepareSupportRequest();
});
document.getElementById('estate-document-input').addEventListener('change', function(event) {
  const files = Array.from(event.target.files || []);
  const target = document.getElementById('selected-documents');
  target.textContent = files.length ? files.length + (files.length === 1 ? ' document selected locally. It has not been uploaded.' : ' documents selected locally. They have not been uploaded.') : 'No documents selected. Files remain on this device.';
});

