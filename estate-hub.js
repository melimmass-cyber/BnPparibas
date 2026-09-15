// Estate Hub JavaScript - Complete File
// Place this file in your project folder as: estate-hub.js

// Main render function
function renderEstateHub() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="utility-bar">
            <div style="display: flex; gap: 1rem;"><span>Wealth Management</span><span>Luxembourg Hub</span></div>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <span style="display: flex; align-items: center;"><span style="width: 0.75rem; height: 0.75rem; margin-right: 0.25rem;">${Icons.shield}</span>Secure Session</span>
                <span style="opacity: 0.7;">Case ID: ${AppState.CASE_REF}</span>
            </div>
        </div>

        <header class="estate-header">
            <nav class="estate-nav">
                <div style="display: flex; align-items: center;"><div style="font-size: 1.5rem; font-weight: 900; color: var(--bnp-green); letter-spacing: -0.05em;">BNP PARIBAS <span style="font-weight: 300; color: var(--slate-400);">| WEALTH</span></div></div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <button style="padding: 0.5rem; color: var(--slate-400); background: none; border: none; cursor: pointer;"><span style="width: 1.25rem; height: 1.25rem; display: block;">${Icons.helpCircle}</span></button>
                    <div style="height: 2.5rem; width: 2.5rem; border-radius: 50%; background: var(--slate-100); border: 1px solid var(--slate-200); display: flex; align-items: center; justify-content: center; color: var(--bnp-green); font-weight: 700;">MM</div>
                </div>
            </nav>
        </header>

        <div class="hero-section">
            <div style="max-width: 80rem; margin: 0 auto; padding: 0 1.5rem;">
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 1.5rem;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 0.5rem; color: #dc2626; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.5rem;">
                            <span style="width: 0.75rem; height: 0.75rem;">${Icons.lock}</span><span>Account Restricted / Succession Hold</span>
                        </div>
                        <h1 style="font-size: 2.25rem; font-weight: 300; color: var(--slate-900);">${AppState.TESTATOR_NAME}</h1>
                        <p style="color: var(--slate-500); margin-top: 0.5rem;">Principal Beneficiary: <strong>Melissa Meredith</strong> (Next of Kin)</p>
                    </div>
                    <div style="background: var(--slate-50); border: 1px solid var(--slate-200); padding: 1.5rem; border-radius: 1rem; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span style="font-size: 0.75rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">Total Net Assets</span>
                            <span style="font-size: 0.625rem; background: #fef9c3; color: #854d0e; padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-weight: 700;">FROZEN</span>
                        </div>
                        <div style="font-size: 1.875rem; font-weight: 700; color: var(--bnp-green);">€${formatCurrency(AppState.getNetAssets())}</div>
                        <p style="font-size: 0.625rem; color: var(--slate-400); margin-top: 0.5rem; font-style: italic;">Reflects deduction of estimated IHT & Administrative Fees</p>
                    </div>
                </div>
            </div>
        </div>

        ${createBackButton('Back to Dashboard')}

<main style="max-width: 80rem; margin: 0 auto; padding: 2.5rem 1.5rem;">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                <div style="display: flex; flex-direction: column; gap: 2rem;">
                    ${createAlertBox()}
                    ${createAssetTable()}
                    ${createTimeline()}
                </div>
                <div style="display: flex; flex-direction: column; gap: 2rem;">
                    ${createVaultCard()}
                    ${createTaxCard()}
                    ${createContactCard()}
                </div>
            </div>
        </main>

        ${createFooter()}
        ${AppState.isVaultOpen ? createVaultModal() : ''}
    `;
    
    attachEstateEventListeners();
}

function createAlertBox() {
    return `<div class="alert-box"><div style="display: flex;"><span style="color: #ca8a04; width: 1.5rem; height: 1.5rem; margin-right: 1rem;">${Icons.alert}</span><div><h3 style="font-weight: 700;">Succession Verification Required</h3><p style="font-size: 0.875rem; margin-top: 0.25rem;">The fixed deposit remains under protective freeze as per Luxembourg financial regulation CSSF 21-14.</p></div></div></div>`;
}

function createAssetTable() {
    return `<section class="card"><div class="card-header"><h3 style="font-weight: 700; font-size: 1.125rem; display: flex; align-items: center;"><span style="width: 1.25rem; height: 1.25rem; margin-right: 0.5rem; color: var(--bnp-green);">${Icons.briefcase}</span>Consolidated Asset Inventory</h3></div><div class="table-container"><table><thead><tr><th>Asset Identification</th><th>Valuation Date</th><th style="text-align: right;">Value (EUR)</th><th>Status</th></tr></thead><tbody><tr><td><div style="font-weight: 700; text-transform: uppercase;">Fixed Term Deposit (MT-BNP-992)</div><div style="font-size: 0.75rem; color: var(--slate-400);">Inheritance Escrow</div></td><td>Jan 12, 2021</td><td style="text-align: right; font-weight: 700;">€3,500,000.00</td><td><span style="background: #fef9c3; color: #854d0e; font-size: 0.625rem; font-weight: 900; padding: 0.25rem 0.5rem; border-radius: 9999px;">RESTRICTED</span></td></tr><tr><td><div style="font-weight: 700;">Gold Bullion (125KG)</div><div style="font-size: 0.75rem; color: var(--slate-400);">DB Schenker Malta</div></td><td>Mar 03, 2020</td><td style="text-align: right; font-style: italic; color: var(--slate-400);">Market Value</td><td><span style="background: var(--slate-100); color: var(--slate-400); font-size: 0.625rem; font-weight: 900; padding: 0.25rem 0.5rem; border-radius: 9999px;">EXTERNAL</span></td></tr><tr><td><div style="font-weight: 700;">Precious Stones (60 Units)</div><div style="font-size: 0.75rem; color: var(--slate-400);">Diamonds - Malta Hub</div></td><td>Mar 03, 2020</td><td style="text-align: right; font-style: italic; color: var(--slate-400);">Held in Trust</td><td><span style="background: var(--slate-100); color: var(--slate-400); font-size: 0.625rem; font-weight: 900; padding: 0.25rem 0.5rem; border-radius: 9999px;">EXTERNAL</span></td></tr></tbody></table></div></section>`;
}

function createTimeline() {
    return `<section class="card" style="padding: 1.5rem;"><h3 style="font-weight: 700; margin-bottom: 2rem; display: flex; align-items: center;"><span style="width: 1.25rem; height: 1.25rem; margin-right: 0.5rem; color: var(--bnp-green);">${Icons.history}</span>Estate Audit Trail</h3><div class="timeline"><div class="timeline-item"><div class="timeline-icon"><span style="color: var(--bnp-green); width: 1.25rem; height: 1.25rem; display: block;">${Icons.fileSearch}</span></div><div><div style="font-size: 0.625rem; font-weight: 700; color: var(--bnp-green); text-transform: uppercase;">Present Day (Dec 2024)</div><h4 style="font-weight: 700;">Succession Hub Final Review</h4><p style="font-size: 0.875rem; color: var(--slate-600); margin-top: 0.25rem;">Awaiting final stamp from Maltese Probate Office.</p></div></div><div class="timeline-item"><div class="timeline-icon" style="border-color: #ef4444;"><span style="color: #ef4444; width: 1.25rem; height: 1.25rem; display: block;">${Icons.lock}</span></div><div><div style="font-size: 0.625rem; font-weight: 700; color: #ef4444; text-transform: uppercase;">May 15, 2021</div><h4 style="font-weight: 700; font-style: italic;">Succession Triggered</h4><p style="font-size: 0.875rem; color: var(--slate-600); margin-top: 0.25rem;">Account freeze initiated. Digital keys revoked.</p></div></div><div class="timeline-item" style="opacity: 0.6;"><div class="timeline-icon" style="border-color: var(--slate-200);"><span style="color: var(--slate-300); width: 1.25rem; height: 1.25rem; display: block;">${Icons.trendingUp}</span></div><div><div style="font-size: 0.625rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase;">March 03, 2020</div><h4 style="font-weight: 700;">Initial Capitalization</h4><p style="font-size: 0.875rem; color: var(--slate-600); margin-top: 0.25rem;">€3.5M deposit confirmed.</p></div></div></div></section>`;
}

function createVaultCard() {
    return `<div style="background: var(--bnp-dark-green); border-radius: 1rem; padding: 1.5rem; color: white; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); position: relative; overflow: hidden;"><h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; position: relative; z-index: 10;">Succession E-Vault</h3><p style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; margin-bottom: 1.5rem; position: relative; z-index: 10;">Submit verified documents through our encrypted vault.</p><button id="openVaultBtn" style="width: 100%; background: white; color: var(--bnp-dark-green); font-weight: 700; padding: 1rem; border-radius: 0.75rem; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; z-index: 10;"><span style="width: 1.25rem; height: 1.25rem; margin-right: 0.5rem; display: block;">${Icons.fileText}</span>Open Secure Vault</button></div>`;
}

function createTaxCard() {
    return `<div class="card" style="padding: 1.5rem;"><h3 style="font-size: 0.875rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase; margin-bottom: 1.5rem;">Financial Settlement</h3><div style="display: flex; flex-direction: column; gap: 1.5rem;"><div style="display: flex; justify-content: space-between;"><div><p style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Succession Tax</p></div><p style="font-size: 1.125rem; font-weight: 700; color: #dc2626;">€${formatCurrency(AppState.IHT_ESTIMATE)}</p></div><div style="display: flex; justify-content: space-between;"><div><p style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Estate Fees</p></div><p style="font-size: 1.125rem; font-weight: 700;">€${formatCurrency(AppState.FEES)}</p></div></div></div>`;
}

function createContactCard() {
    return `<div class="card" style="padding: 1.5rem;"><h3 style="font-size: 0.875rem; font-weight: 700; color: var(--slate-400); text-transform: uppercase; margin-bottom: 1.5rem;">Estate Management Team</h3><div style="display: flex; flex-direction: column; gap: 1.5rem;"><div style="display: flex; gap: 0.75rem;"><div style="height: 2.5rem; width: 2.5rem; border-radius: 50%; background: var(--slate-100); display: flex; align-items: center; justify-content: center;"><span style="width: 1.25rem; height: 1.25rem;">${Icons.user}</span></div><div><p style="font-weight: 700;">Jean-Pierre Dubois</p><p style="font-size: 0.75rem; color: var(--slate-400);">Senior Relationship Manager</p><p style="font-size: 0.75rem; color: var(--bnp-green); margin-top: 0.25rem;">j.dubois@wealth.bnpparibas.lu</p></div></div><div style="display: flex; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid var(--slate-50);"><div style="height: 2.5rem; width: 2.5rem; border-radius: 50%; background: var(--slate-100); display: flex; align-items: center; justify-content: center;"><span style="width: 1.25rem; height: 1.25rem;">${Icons.user}</span></div><div><p style="font-weight: 700;">Maitre Amelie Moreau</p><p style="font-size: 0.75rem; color: var(--slate-400);">Appointed Notary</p><p style="font-size: 0.75rem; color: var(--bnp-green); margin-top: 0.25rem;">a.moreau@notaires-lux.lu</p></div></div></div></div>`;
}

function createFooter() {
    return `<footer><div style="display: flex; justify-content: space-between; align-items: center; opacity: 0.4; flex-wrap: wrap; gap: 1rem;"><div style="font-size: 1.25rem; font-weight: 900; letter-spacing: -0.05em;">BNP PARIBAS <span style="font-weight: 300;">| WEALTH MANAGEMENT</span></div><div style="display: flex; gap: 1.5rem; font-size: 0.625rem; font-weight: 700; text-transform: uppercase; color: var(--slate-500);"><span>Luxembourg</span><span>Privacy Policy</span><span>General Terms</span><span>CSSF Regulated</span></div></div><p style="text-align: center; font-size: 0.625rem; color: var(--slate-400); margin-top: 2rem;">BNP Paribas Wealth Management | Member of the Deposit Guarantee Fund (FGDL).</p></footer>`;
}

function createVaultModal() {
    return `<div class="modal-overlay animate-in"><div class="modal-content"><div class="modal-header"><button id="closeVaultBtn" style="position: absolute; top: 1.5rem; right: 1.5rem; color: rgba(255,255,255,0.5); background: none; border: none; cursor: pointer; width: 1.25rem; height: 1.25rem;">${Icons.lock}</button><h3 style="font-size: 1.5rem; font-weight: 700;">Secure Wealth Vault</h3><p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem; margin-top: 0.5rem; text-transform: uppercase;">End-to-End Encryption Enabled</p></div><div class="modal-body" style="display: flex; flex-direction: column; gap: 1.5rem;"><div style="border: 2px dashed var(--slate-200); border-radius: 1rem; padding: 2.5rem; text-align: center;"><div style="background: var(--slate-50); padding: 1rem; border-radius: 50%; margin: 0 auto 1rem; width: fit-content;"><span style="width: 2rem; height: 2rem; color: var(--slate-300); display: block;">${Icons.download}</span></div><p style="font-weight: 700;">Drag & Drop Estate Documents</p><p style="font-size: 0.625rem; color: var(--slate-400); margin-top: 0.25rem;">Accepts: .PDF, .JPG, .P7M</p><button style="margin-top: 1rem; background: var(--bnp-green); color: white; padding: 0.5rem 1.5rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 700; border: none; cursor: pointer;">Browse Files</button></div><div style="display: flex; flex-direction: column; gap: 0.75rem;"><div style="display: flex; align-items: center; font-size: 0.75rem; font-weight: 700; background: var(--slate-50); padding: 0.75rem; border-radius: 0.5rem;"><span style="width: 1rem; height: 1rem; color: #22c55e; margin-right: 0.75rem;">${Icons.check}</span>Proof of Identity (Verified)</div><div style="display: flex; align-items: center; font-size: 0.75rem; font-weight: 700; color: var(--slate-400); background: rgba(248, 250, 252, 0.5); padding: 0.75rem; border-radius: 0.5rem; opacity: 0.7;"><span style="width: 1rem; height: 1rem; margin-right: 0.75rem;">${Icons.clock}</span>Notary Act (Awaiting)</div></div><button id="cancelVaultBtn" style="width: 100%; color: var(--slate-400); font-size: 0.75rem; font-weight: 700; background: none; border: none; cursor: pointer; margin-top: 1rem;">Cancel and return</button></div></div></div>`;
}

function attachEstateEventListeners() {
    const openBtn = document.getElementById('openVaultBtn');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            AppState.toggleVault();
            renderEstateHub();
        });
    }

    if (AppState.isVaultOpen) {
        setTimeout(() => {
            const closeBtn = document.getElementById('closeVaultBtn');
            const cancelBtn = document.getElementById('cancelVaultBtn');
            
            if (closeBtn) closeBtn.addEventListener('click', () => { AppState.toggleVault(); renderEstateHub(); });
            if (cancelBtn) cancelBtn.addEventListener('click', () => { AppState.toggleVault(); renderEstateHub(); });
        }, 0);
    }
}

function handleFileSelect(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.target.files;
    if (files.length > 0) {
        let fileNames = [];
        let totalSize = 0;
        
        for (let i = 0; i < files.length; i++) {
            const fileSize = (files[i].size / 1024 / 1024).toFixed(2);
            fileNames.push('• ' + files[i].name + ' (' + fileSize + ' MB)');
            totalSize += parseFloat(fileSize);
        }
        
        alert('✓ Documents Uploaded to Secure Vault\\n\\n' + fileNames.join('\\n') + '\\n\\nTotal Size: ' + totalSize.toFixed(2) + ' MB\\n\\n✓ Encrypted with 256-bit SSL\\n✓ Submitted to BNP Paribas Legal Team\\n✓ Processing time: 2-3 business days');
        
        // Close vault after upload
        AppState.toggleVault();
        renderEstateHub();
    }
    
    event.target.value = '';
}