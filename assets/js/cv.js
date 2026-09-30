import { createCvPdf } from './cv-pdf.js?v=20260930-shared';

const dialog = document.querySelector('#cv-dialog');
const form = document.querySelector('#cv-form');
const preview = document.querySelector('#cv-preview');
const download = document.querySelector('#cv-download');
const status = document.querySelector('#cv-status');
const savedKey = 'miyuru-cv-options-v1';
const wording = JSON.parse(document.querySelector('#cv-wording').textContent);
const source = JSON.parse(document.querySelector('#cv-data').textContent);
const entry = (title = '', meta = '', values = [], url = '') => ({ title, meta, paragraphs: values, url });
const records = values => values.map(record => ({
  // Preserve existing selection IDs while displaying institution lines with a separator.
  ...entry(record.title, [record.date, [record.organization, record.institution].filter(Boolean).join(' ')].filter(Boolean).join(' | '), record.paragraphs),
  date: record.date, organization: [record.organization, record.institution].filter(Boolean).join(' · '), coursework: record.coursework,
  institution: record.institution || record.organization, department: record.institution ? record.organization : ''
}));
const publications = values => values.map(paper => ({
  ...entry(paper.title, [paper.venue, paper.credit].filter(Boolean).join(' '), [paper.summary], paper.url),
  cvId: paper.id, citationMeta: [paper.venue, paper.credit].filter(Boolean).join(' | ')
}));

// Shared build-time data keeps every page's CV complete. News is deliberately excluded.
const sections = [
  { id: 'summary', title: 'Profile', items: [entry('', '', source.profile.summary)] },
  { id: 'highlights', title: 'Engineering results', items: wording.engineering_results.map(result => ({ ...entry(`${result.value} — ${result.label}`, '', [result.description]), ...result })) },
  { id: 'expertise', title: 'Technical expertise', items: wording.expertise.map(value => entry('', '', [value])) },
  { id: 'research', title: 'Research focus', items: [entry('', '', source.profile.research)] },
  { id: 'experience', title: 'Professional experience', items: records(source.profile.experience) },
  { id: 'education', title: 'Education', items: records(source.profile.education) },
  { id: 'publications', title: 'Selected publications', items: publications(source.publications.filter(paper => !paper.contribution)) },
  { id: 'review', title: 'Review Experience', items: records(source.profile.review) },
  { id: 'awards', title: 'Honours and awards', items: source.profile.awards.map(award => ({ ...entry(award.title, '', award.paragraphs), optional: award.collapsed })) },
  { id: 'earlier', title: 'Earlier education', items: records(source.profile.earlier) },
  { id: 'contributions', title: 'Additional research contributions', items: publications(source.publications.filter(paper => paper.contribution)) },
  { id: 'interests', title: 'Personal interests', items: [entry('', '', [source.profile.interests])] }
];
sections.forEach(section => section.items.forEach(item => { item.id = `${section.id}:${item.title || item.paragraphs[0]}:${item.meta}`; }));
const contacts = source.contacts.map(contact => ({ ...contact, url: new URL(contact.url, document.baseURI).href, kind: contact.url.startsWith('mailto:') ? 'email' : 'web' }));

const orders = {
  company: ['summary', 'expertise', 'experience', 'highlights', 'education', 'publications', 'research', 'review', 'contributions', 'awards', 'earlier', 'interests'],
  academia: ['summary', 'research', 'highlights', 'education', 'publications', 'review', 'experience', 'expertise', 'awards', 'contributions', 'earlier', 'interests']
};
let state;
let opener;
let libraryPromise;
let fontPromise;
let pdfUrl;

function preset(audience) {
  const selected = audience === 'company'
    ? ['summary', 'highlights', 'expertise', 'experience', 'education']
    : ['summary', 'research', 'education', 'publications', 'experience', 'review', 'expertise', 'awards'];
  return {
    audience,
    sections: Object.fromEntries(sections.map(section => [section.id, selected.includes(section.id)])),
    entries: Object.fromEntries(sections.flatMap(section => section.items.map(item => [item.id, !item.optional]))),
    contacts: Object.fromEntries(contacts.map(contact => [contact.id, ['website', 'github', 'linkedin', audience === 'company' ? 'personal' : 'university', ...(audience === 'academia' ? ['google-scholar'] : [])].includes(contact.id)])),
    hyperlinks: true,
    descriptions: true,
    grades: audience === 'academia',
    coursework: false
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
  // Retain explicit certificate choices saved before it moved out of Earlier education.
  const certificate = sections.find(section => section.id === 'education').items.find(item => item.title === 'Certificate Level in Management (CIMA)');
  if (certificate && typeof saved?.entries?.[certificate.id] !== 'boolean') {
    const previousId = `earlier:Certificate Level in Management:${certificate.meta}`;
    if (typeof saved?.entries?.[previousId] === 'boolean') state.entries[certificate.id] = saved.entries[previousId];
  }
  for (const key of ['hyperlinks', 'descriptions', 'grades', 'coursework']) if (typeof saved?.[key] === 'boolean') state[key] = saved[key];
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
  document.querySelector('#cv-hyperlinks').checked = state.hyperlinks;
  document.querySelector('#cv-descriptions').checked = state.descriptions;
  document.querySelector('#cv-grades').checked = state.grades;
  document.querySelector('#cv-coursework').checked = state.coursework;
  document.querySelector('#cv-preset-description').textContent = state.audience === 'company'
    ? 'The shared classic template, emphasizing technical expertise, professional experience, and engineering results.'
    : 'The shared classic template, emphasizing research, publications, and academic service.';
  update();
}

function model() {
  return {
    name: source.name,
    headline: state.audience === 'company' ? 'Embedded Intelligence | Hardware Acceleration' : source.profile.headline,
    audience: state.audience,
    contacts: contacts.filter(contact => state.contacts[contact.id] && (state.hyperlinks || contact.kind === 'email')).map(contact => ({
      ...contact,
      text: contact.kind === 'email' ? contact.text : contact.label,
      url: state.hyperlinks ? contact.url : ''
    })),
    sections: orders[state.audience].filter(id => state.sections[id]).map(id => {
      const section = sections.find(value => value.id === id);
      const items = section.items.filter(item => state.entries[item.id]).map((item, index) => {
        let values = [...item.paragraphs];
        if (state.coursework && item.coursework) values.push(`Selected coursework: ${state.grades ? item.coursework : item.coursework.replace(/ \(A\+\)/g, '')}`);
        if (id === 'summary') values = [state.audience === 'company' ? wording.company_summary : wording.academic_summary];
        if (id === 'research') values = [wording.research_focus];
        if (item.cvId && wording.publications[item.cvId]) values = [wording.publications[item.cvId]];
        if (state.audience === 'company') {
          if (id === 'experience' && wording.company_roles[item.title]) values = wording.company_roles[item.title];
          if (item.cvId && wording.company_publications[item.cvId]) values = [wording.company_publications[item.cvId]];
          if (id === 'education' && item.title.startsWith('Doctor of Philosophy')) values = ['Final-year candidate (in progress).'];
        }
        if (!state.descriptions && ['experience', 'publications', 'contributions'].includes(id)) values = [];
        if (!state.grades && ['education', 'earlier'].includes(id)) values = values.filter(value => !/A\/L:|O\/L:/.test(value)).map(value => value.replace(/ · GPA:.*/, ''));
        if (id === 'awards') return entry('', '', [[item.title, ...values].join(' — ')]);
        if (id === 'highlights') return { ...entry('', '', [`${item.value} — ${values.join(' ')}`]), bullets: true };
        if (id === 'education') {
          return {
            title: item.institution,
            meta: state.audience === 'company' && item.title.startsWith('Doctor of Philosophy') ? 'Ph.D., Computer Science' : item.title,
            date: item.date, paragraphs: [...(item.department ? [item.department] : []), ...values]
          };
        }
        return {
          title: item.title, meta: item.citationMeta ?? item.organization ?? item.meta,
          date: item.date, number: id === 'publications' ? index + 1 : undefined,
          bullets: id === 'experience', paragraphs: values, url: state.hyperlinks ? item.url : ''
        };
      });
      return {
        id,
        title: id === 'summary' && state.audience === 'company' ? 'Professional profile' : section.title,
        items: id === 'expertise' && items.length ? [entry('', '', [items.flatMap(item => item.paragraphs).join('; ')])] : items
      };
    }).filter(section => section.items.length)
  };
}

function renderPreview(data) {
  preview.dataset.audience = data.audience;
  const header = element('header', 'cv-preview-header');
  header.append(element('h3', '', data.name), element('p', 'cv-headline', data.headline));
  const contactGroup = element('div', 'cv-contacts');
  for (const kind of ['email', 'web']) {
    const contacts = data.contacts.filter(contact => contact.kind === kind);
    if (!contacts.length) continue;
    const row = element('p', 'cv-contact-row');
    for (const contact of contacts) {
      const label = element(contact.url ? 'a' : 'span', '', contact.text);
      if (contact.url) {
        label.href = contact.url;
        if (kind === 'web') { label.target = '_blank'; label.rel = 'noopener'; }
      }
      row.append(label);
    }
    contactGroup.append(row);
  }
  header.append(contactGroup);
  preview.replaceChildren(header);
  data.sections.forEach(section => {
    const container = element('section', `cv-content-section cv-section-${section.id}`);
    preview.append(container);
    const heading = element('h4', '', section.title);
    container.append(heading);
    section.items.forEach(item => {
      const block = element('div', 'cv-preview-item');
      if (item.number) {
        block.classList.add('cv-publication-item');
        block.append(element('span', 'cv-publication-number', `[${item.number}]`));
      }
      if (item.title) {
        const heading = element('div', 'cv-entry-heading');
        const title = element('h5', '', item.title);
        if (item.url) {
          const link = element('a', 'cv-entry-link', item.title);
          link.href = item.url; link.target = '_blank'; link.rel = 'noopener';
          title.replaceChildren(link);
        }
        heading.append(title);
        if (item.date) heading.append(element('span', 'cv-entry-date', item.date));
        block.append(heading);
      }
      if (item.meta) block.append(element('p', 'cv-item-meta', item.meta));
      if (item.bullets && item.paragraphs.length) {
        const list = element('ul', 'cv-entry-bullets');
        item.paragraphs.forEach(value => list.append(element('li', '', value)));
        block.append(list);
      } else item.paragraphs.forEach(value => block.append(element('p', '', value)));
      container.append(block);
    });
  });
}

function update() {
  form.querySelectorAll('[data-group="entries"]').forEach(input => { input.disabled = !state.sections[input.closest('[data-section]').dataset.section]; });
  form.querySelectorAll('[data-group="contacts"]').forEach(input => { input.disabled = !state.hyperlinks && contacts.find(contact => contact.id === input.dataset.key).kind === 'web'; });
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

// Self-hosted, OFL-licensed fonts: no third-party requests or rasterized text.
function loadCvFonts() {
  if (!fontPromise) fontPromise = Promise.all(['cmunrm', 'cmunbx', 'cmunti'].map(async name => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(new URL(`../fonts/computer-modern/${name}.ttf`, import.meta.url), { signal: controller.signal });
      if (!response.ok) throw new Error(`CV font could not load (${response.status})`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      let binary = '';
      for (let start = 0; start < bytes.length; start += 8192) binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
      return btoa(binary);
    } finally { clearTimeout(timeout); }
  })).catch(error => { fontPromise = undefined; throw error; });
  return fontPromise;
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
  if (input.id === 'cv-hyperlinks') state.hyperlinks = input.checked;
  if (input.id === 'cv-descriptions') state.descriptions = input.checked;
  if (input.id === 'cv-grades') state.grades = input.checked;
  if (input.id === 'cv-coursework') state.coursework = input.checked;
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
    const [jsPDF, fonts] = await Promise.all([loadLibrary(), loadCvFonts()]);
    const pdf = createCvPdf(jsPDF, data, fonts);
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
