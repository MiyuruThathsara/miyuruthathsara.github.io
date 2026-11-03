import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { jsPDF } from 'jspdf';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCvPdf } from '../assets/js/cv-pdf.js';

const fonts = await Promise.all(['cmunrm', 'cmunbx', 'cmunti'].map(async name =>
  (await readFile(new URL(`../assets/fonts/computer-modern/${name}.ttf`, import.meta.url))).toString('base64')));
const lines = (prefix, count) => Array.from({ length: count }, (_, index) => `${prefix} line ${String(index + 1).padStart(2, '0')}`);
const entry = (title, paragraphs, extra = {}) => ({ title, meta: '', paragraphs, ...extra });
const preamble = count => ({ id: 'summary', title: 'Profile', items: [entry('', [lines('Preamble', count).join('\n')])] });
const lineText = item => item.str.replace(/^•\s*/, '');

async function inspect(audience, sections) {
  const pdf = createCvPdf(jsPDF, { name: 'Pagination Check', affiliation: '', topics: [], contacts: [], audience, sections }, fonts);
  const task = getDocument({ data: new Uint8Array(pdf.output('arraybuffer')) });
  try {
    const document = await task.promise;
    const pages = [];
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const items = (await page.getTextContent()).items.filter(item => item.str?.trim() && item.height > 8);
      for (const item of items) {
        const baseline = page.view[3] - item.transform[5];
        assert(baseline >= 30 && baseline <= page.view[3] - 50, `Keep body text inside the page: ${item.str}`);
      }
      pages.push({ items, text: items.map(item => item.str).join(' '), links: await page.getAnnotations() });
    }
    return pages;
  } finally { await task.destroy(); }
}

function checkLines(pages, expected) {
  const actual = pages.flatMap(page => page.items.map(lineText)).filter(text => expected.includes(text));
  assert.deepEqual(actual, expected, 'Preserve every line exactly once, in reading order');
}

for (const audience of ['company', 'academia']) {
  // There is room for education entries on page one, but not the whole section.
  const education = await inspect(audience, [preamble(43), {
    id: 'education', title: 'Education', items: ['First', 'Second', 'Third'].map(name =>
      entry(`${name} University`, ['Degree details'], { meta: 'Qualification' }))
  }]);
  assert.equal(education.length, 2);
  assert(education[0].text.includes('First University'), 'Use the remaining page space for Education');
  assert(education[1].text.includes('Third University'), 'Let later education entries continue on the next page');

  // A role can begin in the available space and continue with its description.
  for (const count of [5, 12]) {
    const description = lines('Description', count);
    const pages = await inspect(audience, [preamble(43), {
      id: 'experience', title: 'Experience', items: [entry('Research Engineer', [description.join('\n')], {
        meta: 'Research group', date: '2026', bullets: true, url: 'https://example.org/research'
      })]
    }]);
    assert.equal(pages.length, 2);
    assert(pages[0].text.includes('Research Engineer') && pages[0].text.includes(description[0]), 'Keep the title and start of the description on the available page');
    const perPage = pages.map(page => page.items.filter(item => description.includes(lineText(item))).length);
    assert(perPage.every(amount => amount >= 2), 'Do not leave a single paragraph line on either side of a page break');
    assert(pages[0].links.some(link => link.url === 'https://example.org/research'), 'Keep the title hyperlink on its rendered page');
    assert.equal(pages.flatMap(page => page.items).filter(item => item.str.includes('•')).length, 1, 'Do not repeat a bullet when its paragraph continues');
    checkLines(pages, description);
  }

  // A section must move when only its heading would fit at the bottom.
  const headed = await inspect(audience, [preamble(49), {
    id: 'experience', title: 'Experience', items: [entry('Next Role', ['Opening line\nSecond line'], { meta: 'Organization', date: '2026' })]
  }]);
  const headingPage = headed.findIndex(page => page.items.filter(item => item.height === 12 || item.height === 10).map(item => item.str).join('').includes('EXPERIENCE'));
  assert.equal(headingPage, 1);
  assert(headed[headingPage].text.includes('Next Role') && headed[headingPage].text.includes('Opening line'), 'Keep the section heading with its first entry and body text');

  // Longer user-selected descriptions must flow through several pages intact.
  const longDescription = lines('Long description', 120);
  const long = await inspect(audience, [{ id: 'experience', title: 'Experience', items: [entry('Long Role', [longDescription.join('\n')], { meta: 'Organization' })] }]);
  assert(long.length >= 3);
  assert(long.every(page => page.items.filter(item => longDescription.includes(item.str)).length >= 2));
  checkLines(long, longDescription);
}

console.log('PASS: CV page flow, education spanning pages, heading placement, paragraph widows/orphans, bullets, links, and complete text for both audiences');
