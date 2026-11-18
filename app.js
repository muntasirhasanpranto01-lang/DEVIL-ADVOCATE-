const form = document.querySelector('#review-form');
const ideaField = document.querySelector('#idea');
const modeField = document.querySelector('#mode');
const result = document.querySelector('#result');
const STORAGE_KEY = 'realityforge.review.v1';

const commonQuestions = [
  ['Problem & urgency', 'What specific, frequent, costly problem is being solved—and what evidence demonstrates it is urgent?'],
  ['Buyer & demand', 'Who uses this, who controls the budget, and what have target customers actually done that signals willingness to pay or adopt?'],
  ['Alternatives', 'What direct competitors, substitutes, manual workarounds, or "do nothing" options already solve this well enough?'],
  ['Feasibility & dependencies', 'Which people, permissions, integrations, infrastructure, skills, and partners are essential—and what happens if one fails?'],
  ['Smallest test', 'What low-cost, reversible experiment could disprove the central assumption before significant investment?']
];
const modeQuestions = {
  devil: ['What is the strongest plausible reason the target user rejects this, and what would make switching not worth the effort?', 'Which assumption would cause the most damage if it proved false?'],
  investor: ['What are the setup costs, monthly burn, runway, gross margin, acquisition cost, retention, and break-even assumptions? Which are measured versus guessed?', 'What evidence supports a reachable initial market (SOM), rather than a top-down TAM headline?'],
  cto: ['What is the smallest reliable architecture? Identify data boundaries, security controls, backups, observability, capacity limits, and vendor failure modes.', 'For each component, should you build, buy, outsource, or defer it? What is the integration and maintenance burden?'],
  auditor: ['Which claims are unsupported, obligations or permissions missing, sensitive data exposed, or conflicts of interest unexamined?', 'What could fail operationally, legally, financially, or reputationally? Who owns each mitigation?'],
  execution: ['What is the next milestone, named owner, deliverable, budget, deadline, dependency, and measurable go/no-go gate?', 'Can you validate the riskiest assumption with a smaller and more reversible test?']
};
const modeLabels = {devil:'DEVIL MODE', investor:'INVESTOR MODE', cto:'CTO MODE', auditor:'AUDITOR MODE', execution:'EXECUTION MODE'};

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function renderReview(idea, mode) {
  const safeIdea = escapeHtml(idea.trim());
  const questions = [...commonQuestions, ['Mode-specific challenge', modeQuestions[mode][0]], ['Second challenge', modeQuestions[mode][1]]];
  const lines = questions.map(([label, question], i) => `<li><span class="number">${String(i+1).padStart(2,'0')}</span><div><strong>${label}</strong><p>${question}</p><label class="evidence-label" for="evidence-${i}">Evidence / answer</label><textarea id="evidence-${i}" class="evidence" rows="2" placeholder="Record what you know—or mark it unknown."></textarea></div></li>`).join('');
  result.innerHTML = `<div class="result-heading"><div><p class="eyebrow">02 / ${modeLabels[mode]}</p><h2>Challenge the proposal.</h2></div><button id="copy-button" class="secondary" type="button">Copy review</button></div><div class="proposal"><span class="eyebrow">PROPOSAL UNDER REVIEW</span><p>${safeIdea}</p></div><div class="notice"><strong>Not a verdict:</strong> This checklist does not have enough evidence to score viability. Answer the questions with sourced facts; unknowns are risks to validate, not proof for or against the idea.</div><ol class="question-list">${lines}</ol><div class="decision-box"><label for="decision">Your current decision</label><select id="decision"><option>VALIDATE FIRST</option><option>PROCEED WITH CHANGES</option><option>PROCEED</option><option>REBUILD</option><option>REJECT</option></select><label for="next-step">Next test, owner, and review date</label><textarea id="next-step" rows="3" placeholder="Smallest experiment · owner · budget · deadline · success/failure threshold"></textarea></div>`;
  document.querySelector('#copy-button').addEventListener('click', copyReview);
  result.querySelectorAll('textarea, select').forEach(el => el.addEventListener('input', saveState));
  saveState();
}
function plainText() {
  const title = `${modeLabels[modeField.value]} — REALITYFORGE`;
  const answers = [...result.querySelectorAll('.question-list li')].map((item, i) => {
    const area = item.querySelector('textarea');
    return `${i+1}. ${item.querySelector('strong').textContent}\n${item.querySelector('p').textContent}\nEvidence / answer: ${area.value || '[not answered]'}`;
  }).join('\n\n');
  return `${title}\n\nPROPOSAL\n${ideaField.value.trim()}\n\n${answers}\n\nCURRENT DECISION: ${result.querySelector('#decision')?.value || 'VALIDATE FIRST'}\nNEXT TEST: ${result.querySelector('#next-step')?.value || '[not specified]'}\n\nChecklist only; claims and estimates require independent verification.`;
}
async function copyReview() {
  try { await navigator.clipboard.writeText(plainText()); const button = document.querySelector('#copy-button'); button.textContent = 'Copied'; setTimeout(() => button.textContent = 'Copy review', 1500); }
  catch { window.prompt('Copy your review:', plainText()); }
}
function saveState() {
  if (!document.querySelector('.question-list')) return;
  const answers = [...result.querySelectorAll('.evidence')].map(el => el.value);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({idea:ideaField.value,mode:modeField.value,answers,decision:result.querySelector('#decision').value,nextStep:result.querySelector('#next-step').value}));
}
function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    ideaField.value = saved.idea || '';
    modeField.value = saved.mode || 'devil';
    if (ideaField.value.trim()) {
      renderReview(ideaField.value, modeField.value);
      result.querySelectorAll('.evidence').forEach((el,i) => el.value = saved.answers?.[i] || '');
      result.querySelector('#decision').value = saved.decision || 'VALIDATE FIRST';
      result.querySelector('#next-step').value = saved.nextStep || '';
    }
  } catch { localStorage.removeItem(STORAGE_KEY); }
}
form.addEventListener('submit', event => { event.preventDefault(); if (!ideaField.value.trim()) return; renderReview(ideaField.value, modeField.value); result.scrollIntoView({behavior:'smooth',block:'start'}); });
document.querySelector('#clear-button').addEventListener('click', () => { localStorage.removeItem(STORAGE_KEY); form.reset(); result.innerHTML = '<div class="empty-state"><span class="empty-icon">◈</span><p class="eyebrow">02 / THE REALITY CHECK</p><h2>No assumptions spared.</h2><p>Your structured review will appear here. Start with a specific proposal; the more concrete it is, the more useful the questions.</p></div>'; });
restoreState();
