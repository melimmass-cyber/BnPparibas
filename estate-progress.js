const key = 'estate-demo-progress-v1';
const stages = [
  ['record', 'Estate record', 'Estate parties, account record and asset overview.'],
  ['documents', 'Supporting documents', 'Preparation of the documents requested by the estate representative.'],
  ['questions', 'Authority review', 'Questions and correspondence with the authorised representative.'],
  ['review', 'Estate assessment', 'Follow-up on outstanding information and review requests.'],
  ['planning', 'Distribution planning', 'Preparation for the next steps with the estate representative.'],
];
const statuses = { pending: 'Pending', active: 'In progress', completed: 'Completed', verified: 'Completed & Filed' };
export function initEstateProgress() {
  const root = document.getElementById('inheritance-progress');
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch {}
  const state = Object.fromEntries(stages.map(([id]) => [id, saved[id] === true ? 'completed' : Object.hasOwn(statuses, saved[id]) ? saved[id] : 'pending']));
  root.innerHTML = `<div class="progress-heading"><div><span class="record-eyebrow">Estate administration</span><h2>Inheritance Progress</h2></div></div>
    <p>A connected view of the estate journey. These locally managed statuses illustrate progress; they do not confirm legal verification or release funds.</p>
    <div class="stage-legend" aria-label="Stage colours">${Object.entries(statuses).map(([id,label]) => `<span class="stage-${id}"><i aria-hidden="true"></i>${label}</span>`).join('')}</div>
    <div class="progress-summary"><strong id="progress-count"></strong><span id="progress-percent"></span></div><progress id="estate-meter" max="5" value="0" aria-label="Inheritance stage completion"></progress>
    <ol class="estate-stage-tree">${stages.map(([id,title,copy],index) => `<li data-stage="${id}"><span class="stage-node" aria-hidden="true">${index+1}</span><article class="stage-card"><div class="stage-card-heading"><span class="stage-number">STAGE ${String(index+1).padStart(2,'0')}</span><span class="stage-badge"></span></div><h3>${title}</h3><p>${copy}</p></article></li>`).join('')}</ol>
    <details class="stage-editor"><summary>Update stages</summary><p>Changes are saved on this account only.</p>${stages.map(([id,title]) => `<label>${title}<select data-step="${id}" aria-label="${title} status">${Object.entries(statuses).map(([value,label]) => `<option value="${value}"${state[id] === value ? ' selected' : ''}>${label}</option>`).join('')}</select></label>`).join('')}</details><p id="progress-storage" class="progress-storage" role="status">Legal documentation progress · Awaiting verified claim and payment approval</p>`;
  function update() {
    const count = Object.values(state).filter(value => value === 'completed' || value === 'verified').length;
    document.getElementById('progress-count').textContent = count + ' of 5 stages complete';
    document.getElementById('progress-percent').textContent = count * 20 + '%';
    document.getElementById('estate-meter').value = count;
    for (const [id] of stages) {
      const row = root.querySelector(`[data-stage="${id}"]`);
      row.className = 'stage-' + state[id];
      row.querySelector('.stage-badge').textContent = statuses[state[id]];
      const index = stages.findIndex(stage => stage[0] === id);
      row.querySelector('.stage-node').textContent = state[id] === 'verified' ? '✓✓' : state[id] === 'completed' ? '✓' : index+1;
    }
  }
  root.addEventListener('change', event => {
    const id = event.target.dataset.step;
    if (!Object.hasOwn(state,id) || !Object.hasOwn(statuses,event.target.value)) return;
    state[id] = event.target.value;
    update();
    try { localStorage.setItem(key,JSON.stringify(state)); document.getElementById('progress-storage').textContent = 'Demo stage updated on this browser. Account status has not changed.'; }
    catch { document.getElementById('progress-storage').textContent = 'Browser storage is unavailable. Changes will not persist after leaving the page.'; }
  });
  update();
}
