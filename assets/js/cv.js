import { createCvPdf } from './cv-pdf.js';

const dialog = document.querySelector('#cv-dialog');
const form = document.querySelector('#cv-form');
const preview = document.querySelector('#cv-preview');
const download = document.querySelector('#cv-download');
const status = document.querySelector('#cv-status');
const savedKey = 'miyuru-cv-options-v1';
const wording = JSON.parse(document.querySelector('#cv-wording').textContent);
const text = node => {
  if (!node) return '';
  const copy = node.cloneNode(true);
  copy.querySelectorAll('br').forEach(br => br.replaceWith(' '));
  return copy.textContent.replace(/\s+/g, ' ').trim();
};
const paragraphs = node => [...node.querySelectorAll(':scope > p')].map(text).filter(Boolean);
const entry = (title = '', meta = '', values = [], url = '') => ({ title, meta, paragraphs: values, url });
const records = selector => [...document.querySelectorAll(selector)].map(record => {
  const body = record.querySelector('div');
  return entry(text(body.querySelector('h3')), [text(record.querySelector('.record-date')), text(body.querySelector('.record-organization'))].filter(Boolean).join(' | '), [...body.querySelectorAll(':scope > p:not(.record-organization)')].map(text));
});
const publications = selector => [...document.querySelectorAll(selector)].map(record => entry(text(record.querySelector('h3')), text(record.querySelector('.publication-venue')), [text(record.querySelector(':scope > p:not(.publication-venue), :scope > div > p:not(.publication-venue)'))].filter(Boolean), record.querySelector('h3 a')?.href || ''));

const sections = [
  { id: 'summary', title: 'Profile', items: [entry('', '', [...document.querySelectorAll('.introduction > p:not([class])')].map(text))] },
  { id: 'expertise', title: 'Technical expertise', items: wording.expertise.map(value => entry('', '', [value])) },
  { id: 'research', title: 'Research focus', items: [entry('', '', paragraphs(document.querySelector('.research-focus')))] },
  { id: 'experience', title: 'Professional experience', items: records('#experience .record') },
  { id: 'education', title: 'Education', items: records('#education > .record') },
  { id: 'publications', title: 'Selected publications', items: publications('#publications .publication:not(.publication-contribution)') },
  { id: 'review', title: 'Review Experience', items: records('#review .record') },
  { id: 'awards', title: 'Honours and awards', items: [...document.querySelectorAll('.award-list li')].map(item => entry(text(item.querySelector('strong')), '', [text(item.querySelector('span'))])) },
  { id: 'earlier', title: 'Earlier education', items: records('.education-details .record') },
  { id: 'contributions', title: 'Additional research contributions', items: publications('.publication-contribution') },
  { id: 'interests', title: 'Personal interests', items: [entry('', '', [text(document.querySelector('.personal-note'))])] }
];
sections.forEach(section => section.items.forEach(item => { item.id = `${section.id}:${item.title || item.paragraphs[0]}:${item.meta}`; }));
const contacts = [...document.querySelectorAll('.contact-list > div')].map(row => {
  const link = row.querySelector('a');
  return { id: text(row.querySelector('dt')).toLowerCase(), label: text(row.querySelector('dt')), text: text(link).replace('↗', '').trim(), url: link.href };
}).concat([...document.querySelectorAll('.profile-sidebar .profile-links a')].map(link => {
  const label = text(link).replace('↗', '').trim();
  return { id: label.toLowerCase().replace(/\s/g, '-'), label, text: link.href.replace(/^https?:\/\//, ''), url: link.href };
}));

const orders = {
  company: ['summary', 'expertise', 'experience', 'education', 'publications', 'review', 'research', 'awards', 'contributions', 'earlier', 'interests'],
  academia: ['summary', 'research', 'education', 'publications', 'experience', 'review', 'expertise', 'awards', 'contributions', 'earlier', 'interests']
};
let state;
let opener;
let libraryPromise;
let pdfUrl;

function preset(audience) {
  const selected = audience === 'company'
    ? ['summary', 'expertise', 'experience', 'education', 'awards']
    : ['summary', 'research', 'education', 'publications', 'experience', 'review', 'expertise', 'awards'];
  return {
    audience,
    sections: Object.fromEntries(sections.map(section => [section.id, selected.includes(section.id)])),
    entries: Object.fromEntries(sections.flatMap(section => section.items.map(item => [item.id, item.title !== 'Chess']))),
    contacts: Object.fromEntries(contacts.map(contact => [contact.id, ['website', 'github', 'linkedin', audience === 'company' ? 'personal' : 'university', ...(audience === 'academia' ? ['google-scholar'] : [])].includes(contact.id)])),
    descriptions: true,
    grades: audience === 'academia'
  };
}

function restore() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(savedKey)); } catch { /* Private browsing may block storage. */ }
  state = preset(saved?.audience === 'company' ? 'company' : 'academia');
  for (const group of ['sections', 'entries', 'contacts']) {
    for (const key of Object.keys(state[group])) {
      if (typeof saved?.[group]?.[key] === 'boolean') state[group][key] = saved[group][key];
    }
  }
  for (const key of ['descriptions', 'grades']) if (typeof saved?.[key] === 'boolean') state[key] = saved[key];
}

function element(tag, className, value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value) node.textContent = value;
  return node;
}

function checkbox(labelText, group, key, checked) {
  const label = element('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.dataset.group = group;
  input.dataset.key = key;
  input.checked = checked;
  label.append(input, element('span', '', labelText));
  return label;
}

function renderOptions() {
  const selections = document.querySelector('#cv-selections');
  selections.replaceChildren();
  for (const section of sections) {
    const group = element('div', 'cv-selection-group');
    group.dataset.section = section.id;
    group.append(checkbox(section.title, 'sections', section.id, state.sections[section.id]));
    if (section.items.length > 1 || section.items[0].title) {
      const details = element('details');
      details.append(element('summary', '', 'Choose entries'));
      section.items.forEach(item => details.append(checkbox(item.title ? `${item.title}${item.meta ? ` — ${item.meta}` : ''}` : item.paragraphs[0], 'entries', item.id, state.entries[item.id])));
      group.append(details);
    }
    selections.append(group);
  }
  const contactOptions = document.querySelector('#cv-contacts');
  contactOptions.replaceChildren(...contacts.map(contact => checkbox(contact.label === 'Personal' || contact.label === 'University' ? `${contact.label} email` : contact.label, 'contacts', contact.id, state.contacts[contact.id])));
  form.elements.audience.value = state.audience;
  document.querySelector('#cv-descriptions').checked = state.descriptions;
  document.querySelector('#cv-grades').checked = state.grades;
  document.querySelector('#cv-preset-description').textContent = state.audience === 'company' ? 'Emphasizes engineering expertise and professional experience.' : 'Emphasizes research, publications, and academic service.';
  update();
}

function model() {
  return {
    name: text(document.querySelector('#profile-title')),
    headline: state.audience === 'company' ? 'Embedded Intelligence | Hardware Acceleration' : text(document.querySelector('.intro-subtitle')),
    audience: state.audience,
    contacts: contacts.filter(contact => state.contacts[contact.id]),
    sections: orders[state.audience].filter(id => state.sections[id]).map(id => {
      const section = sections.find(value => value.id === id);
      const items = section.items.filter(item => state.entries[item.id]).map(item => {
        let values = [...item.paragraphs];
        if (id === 'summary' && state.audience === 'company') values = [wording.company_summary];
        if (!state.descriptions && ['experience', 'publications', 'contributions'].includes(id)) values = [];
        if (!state.grades && ['education', 'earlier'].includes(id)) values = values.filter(value => !/coursework|A\/L:|O\/L:/.test(value)).map(value => value.replace(/ · GPA:.*/, ''));
        return { title: item.title, meta: item.meta, paragraphs: values, url: item.url };
      });
      return {
        title: id === 'summary' && state.audience === 'company' ? 'Professional profile' : section.title,
        items: id === 'expertise' && items.length ? [entry('', '', [items.flatMap(item => item.paragraphs).join('; ')])] : items
      };
    }).filter(section => section.items.length)
  };
}

function renderPreview(data) {
  preview.replaceChildren(element('h3', '', data.name), element('p', 'cv-headline', data.headline));
  data.contacts.forEach(contact => {
    const line = element('p', 'cv-contact-line');
    line.append(`${contact.label}: `);
    const link = element('a', '', contact.text);
    link.href = contact.url;
    line.append(link);
    preview.append(line);
  });
  data.sections.forEach(section => {
    preview.append(element('h4', '', section.title));
    section.items.forEach(item => {
      const block = element('div', 'cv-preview-item');
      if (item.title) block.append(element('h5', '', item.title));
      if (item.meta) block.append(element('p', 'cv-item-meta', item.meta));
      item.paragraphs.forEach(value => block.append(element('p', '', value)));
      if (item.url) {
        const link = element('a', 'cv-entry-link', 'Publication');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener';
        block.append(link);
      }
      preview.append(block);
    });
  });
}

function update() {
  form.querySelectorAll('[data-group="entries"]').forEach(input => { input.disabled = !state.sections[input.closest('[data-section]').dataset.section]; });
  const data = model();
  renderPreview(data);
  download.disabled = !data.sections.length;
  document.querySelector('#cv-selection-count').textContent = `${data.sections.length} sections`;
  status.textContent = data.sections.length ? 'Your selection is ready to download.' : 'Select at least one section and entry to create your CV.';
  // An old download should never be mistaken for the current selection.
  document.querySelector('#cv-open-pdf').hidden = true;
  if (pdfUrl) { URL.revokeObjectURL(pdfUrl); pdfUrl = undefined; }
  try { localStorage.setItem(savedKey, JSON.stringify(state)); } catch { /* Export works without storage. */ }
}

function loadLibrary() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (!libraryPromise) libraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = dialog.dataset.pdfLibrary;
    const timeout = setTimeout(() => { script.remove(); reject(new Error('PDF library load timed out')); }, 15000);
    script.onload = () => {
      clearTimeout(timeout);
      if (window.jspdf?.jsPDF) resolve(window.jspdf.jsPDF);
      else { script.remove(); reject(new Error('PDF library unavailable')); }
    };
    script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('PDF library could not load')); };
    document.head.append(script);
  }).catch(error => { libraryPromise = undefined; throw error; });
  return libraryPromise;
}

restore();
renderOptions();
document.querySelectorAll('[data-open-cv]').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', () => { opener = button; dialog.showModal(); });
});
dialog.querySelector('[data-close-cv]').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => opener?.focus());
document.querySelector('#cv-reset').addEventListener('click', () => { state = preset(state.audience); renderOptions(); });
form.addEventListener('change', event => {
  const input = event.target;
  if (input.name === 'audience') { state = preset(input.value); renderOptions(); return; }
  if (input.dataset.group) state[input.dataset.group][input.dataset.key] = input.checked;
  if (input.id === 'cv-descriptions') state.descriptions = input.checked;
  if (input.id === 'cv-grades') state.grades = input.checked;
  update();
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  const data = model();
  if (!data.sections.length || download.dataset.busy) return;
  download.dataset.busy = 'true';
  download.disabled = true;
  download.textContent = 'Generating PDF…';
  form.querySelectorAll('fieldset').forEach(fieldset => { fieldset.disabled = true; });
  document.querySelector('#cv-reset').disabled = true;
  status.textContent = 'Preparing your PDF…';
  try {
    const jsPDF = await loadLibrary();
    const pdf = createCvPdf(jsPDF, data);
    const filename = `Miyuru-Thathsara-${data.audience === 'company' ? 'Company' : 'Academic'}-CV.pdf`;
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    pdfUrl = URL.createObjectURL(pdf.output('blob'));
    const open = document.querySelector('#cv-open-pdf');
    open.href = pdfUrl;
    open.hidden = false;
    pdf.save(filename);
    status.textContent = `Your ${pdf.getNumberOfPages()}-page CV is ready. If the download did not start, use Open PDF to save or share it.`;
  } catch (error) {
    status.textContent = 'The PDF could not be generated. Please check your connection and try again.';
    console.error('CV generation failed:', error);
  } finally {
    delete download.dataset.busy;
    download.disabled = false;
    download.textContent = 'Download PDF';
    form.querySelectorAll('fieldset').forEach(fieldset => { fieldset.disabled = false; });
    document.querySelector('#cv-reset').disabled = false;
  }
});
window.addEventListener('pagehide', () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); });
