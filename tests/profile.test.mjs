import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { resolve, extname, sep, join } from 'node:path';
import { tmpdir } from 'node:os';
import { chromium, webkit } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';

const root = resolve(process.env.SITE_DIR || '_site');
await readFile(join(root, 'index.html'));
const artifacts = await mkdtemp(join(tmpdir(), 'miyuru-profile-test-'));
console.log(`Artifacts: ${artifacts}`);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
const server = createServer(async (req, res) => {
  const path = resolve(root, `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`);
  if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try {
    const file = path === root ? join(root, 'index.html') : path;
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = process.env.BROWSER === 'webkit' ? await webkit.launch() : await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce', acceptDownloads: true });
const page = await context.newPage();
const pageErrors = [];
const pdfInspections = new Map();
let websiteSummaries = [];
let newsHeadlines = [];
page.on('pageerror', error => pageErrors.push(error.message));

async function audit() {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
}

async function readPdf(bytes, name, render = false) {
  const task = getDocument({ data: new Uint8Array(bytes), standardFontDataUrl: resolve('node_modules/pdfjs-dist/standard_fonts') + sep });
  const pdf = await task.promise;
  const inspection = { links: [], firstPage: null, pages: [], pageCount: pdf.numPages };
  let text = '';
  for (let number = 1; number <= pdf.numPages; number++) {
    const pdfPage = await pdf.getPage(number);
    const viewport = pdfPage.getViewport({ scale: 1 });
    const content = await pdfPage.getTextContent();
    const items = content.items.filter(item => item.str?.trim());
    inspection.links.push(...(await pdfPage.getAnnotations()).filter(annotation => annotation.subtype === 'Link'));
    if (number === 1) inspection.firstPage = { items, width: viewport.width };
    inspection.pages.push(items);
    assert(Object.values(content.styles).every(style => style.fontFamily === 'sans-serif'), `Use consistent sans-serif typography in ${name}`);
    assert(items.length > 5, `Unexpected empty page in ${name}`);
    for (const item of items) {
      const x = item.transform[4], y = item.transform[5];
      assert(x >= 40 && x + item.width <= viewport.width - 39, `Text outside horizontal margins in ${name}: ${item.str}`);
      assert(y >= 18 && y <= viewport.height - 18, `Text outside vertical margins in ${name}: ${item.str}`);
    }
    text += items.map(item => item.str).join(' ') + '\n';
    if (render && number <= 2) {
      const scaled = pdfPage.getViewport({ scale: 1.5 });
      const canvas = createCanvas(Math.ceil(scaled.width), Math.ceil(scaled.height));
      await pdfPage.render({ canvasContext: canvas.getContext('2d'), viewport: scaled }).promise;
      await writeFile(join(artifacts, `${name}-${number}.png`), canvas.toBuffer('image/png'));
    }
  }
  console.log(`PDF ${name}: ${pdf.numPages} pages; selectable text and margins verified`);
  assert(!/\bNEWS\b/.test(text), `News must never appear in ${name}`);
  assert(newsHeadlines.every(headline => !text.includes(headline)), `Website news leaked into ${name}`);
  assert(websiteSummaries.every(summary => !text.includes(summary)), `Use formal CV paper descriptions, not website copy, in ${name}`);
  pdfInspections.set(name, inspection);
  await task.destroy();
  return text;
}

async function downloadPdf(name, render = false) {
  const [file] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#cv-download').click()
  ]);
  assert(file.suggestedFilename().endsWith('.pdf'));
  const path = join(artifacts, `${name}.pdf`);
  await file.saveAs(path);
  return readPdf(await readFile(path), name, render);
}

try {
  await page.goto(base);
  await page.locator('[data-open-cv]').waitFor({ state: 'visible' });
  assert.equal(await page.title(), 'Miyuru Thathsara | Personal Profile');
  assert.equal(await page.locator('.profile-photo').getAttribute('src'), '/me.jpeg');
  assert.match(await page.locator('#review').innerText(), /External Reviewer[\s\S]*ICCAD 2026/);
  assert(!/\bSCSE\b/.test(await page.locator('main').innerText()));
  assert.match(await page.locator('#experience').innerText(), /HESL, CCDS/);
  assert.equal(await page.locator('h1').count(), 1, 'Keep a single profile name for all screen sizes');
  assert.equal(await page.locator('.news-list li').count(), 3);
  newsHeadlines = await page.locator('.news-list h3').allTextContents();
  assert(await page.locator('nav a[href="#news"]').isVisible());
  websiteSummaries = await page.locator('.publication > p:not(.publication-venue), .publication > div > p:not(.publication-venue)').allTextContents();
  assert.equal(websiteSummaries.length, 5);
  assert(websiteSummaries.every(summary => summary.trim().split(/\s+/).length <= 40), 'Website paper summaries should be brief');
  for (const link of await page.locator('.news-list a').all()) {
    assert.equal(await page.locator(await link.getAttribute('href')).count(), 1, 'News links should target existing sections');
  }
  for (const width of [1440, 1024, 800, 768, 540, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 });
    for (const img of await page.locator('main img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(image => image.decode());
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow at ${width}`);
    const frame = await page.locator('.profile-photo-frame').boundingBox();
    const photo = await page.locator('.profile-photo').boundingBox();
    assert(frame.width >= 220);
    assert(Math.abs(photo.width / photo.height - 1) < 0.01, 'The full square photograph must retain its proportions');
    assert(photo.x >= frame.x - 1 && photo.y >= frame.y - 1 && photo.x + photo.width <= frame.x + frame.width + 1 && photo.y + photo.height <= frame.y + frame.height + 1, 'The photograph must fit completely inside its frame');
    if (width <= 800) {
      const heading = await page.locator('.profile-heading').boundingBox();
      assert(heading.y + heading.height <= photo.y + 1, 'Mobile name and headline must precede the photograph');
      const nav = await page.locator('.site-header nav').boundingBox();
      const rows = new Map();
      for (const link of await page.locator('.site-header nav a').all()) {
        const box = await link.boundingBox();
        const key = Math.round(box.y);
        rows.set(key, [...(rows.get(key) || []), box]);
      }
      for (const boxes of rows.values()) {
        const left = Math.min(...boxes.map(box => box.x));
        const right = Math.max(...boxes.map(box => box.x + box.width));
        assert(Math.abs((left + right) / 2 - nav.x - nav.width / 2) < 2, `Every mobile navigation row should be centered at ${width}`);
      }
    }
    for (const figure of await page.locator('.publication-media').all()) {
      const bounds = await figure.boundingBox();
      assert(bounds.width <= 240 && bounds.height <= 215, 'Publication previews should remain compact');
    }
    if ([1440, 390].includes(width)) {
      await page.evaluate(() => scrollTo(0, 0));
      await audit();
      await page.screenshot({ path: join(artifacts, `profile-${width}.png`) });
      await page.locator('.publication').nth(2).screenshot({ path: join(artifacts, `diagram-${width}.png`) });
      await page.locator('#news').screenshot({ path: join(artifacts, `news-${width}.png`) });
    }
    console.log(`PASS: ${width}px image sizing and page layout`);
  }

  await page.locator('[data-vector-url]').click();
  await page.locator('#image-full').evaluate(image => image.decode());
  await page.waitForFunction(() => document.querySelector('#image-zoom-out').disabled);
  const initialWidth = (await page.locator('#image-full').boundingBox()).width;
  await page.locator('#image-zoom-in').click();
  assert((await page.locator('#image-full').boundingBox()).width > initialWidth);
  assert(await page.locator('#image-vector').isVisible());
  await page.locator('#image-fit').click();
  await audit();
  await page.keyboard.press('Escape');
  assert(await page.locator('[data-vector-url]').evaluate(el => document.activeElement === el));
  await page.locator('.profile-photo-link').click();
  assert(!await page.locator('#image-vector').isVisible());
  assert.equal(await page.locator('#image-original').getAttribute('href'), `${base}/me.jpeg`);
  await page.locator('[data-close-image]').click();

  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 });
    await page.locator('[data-open-cv]').click();
    await page.locator('input[data-group="contacts"][data-key="personal"]').check();
    assert(await page.locator('#cv-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `CV overflow at ${width}`);
    assert(await page.locator('#cv-preview').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `CV preview overflow at ${width}`);
    assert.equal(await page.locator('.cv-preview-header').evaluate(el => getComputedStyle(el).textAlign), 'center');
    const links = page.locator('.cv-contact-row').last().locator('a');
    assert.deepEqual(await links.allTextContents(), ['Website', 'Google Scholar', 'LinkedIn', 'GitHub']);
    if (width === 1440) {
      const boxes = await Promise.all((await links.all()).map(link => link.boundingBox()));
      assert(boxes.every(box => Math.abs(box.y - boxes[0].y) < 1), 'Desktop profile links should share a horizontal row');
    }
    const downloadBounds = await page.locator('#cv-download').boundingBox();
    assert(downloadBounds.y + downloadBounds.height <= 1100, `Download button not reachable at ${width}`);
    await audit();
    await page.screenshot({ path: join(artifacts, `builder-${width}.png`) });
    await page.locator('.cv-preview-header').evaluate(el => el.scrollIntoView({ block: 'center' }));
    const headerBounds = await page.locator('.cv-preview-header').boundingBox();
    const barBounds = await page.locator('.cv-download-bar').boundingBox();
    assert(headerBounds.y + headerBounds.height <= barBounds.y, `CV header should be viewable above the download bar at ${width}`);
    await page.locator('.cv-preview-header').screenshot({ path: join(artifacts, `cv-header-${width}.png`) });
    await page.locator('input[data-group="contacts"][data-key="personal"]').uncheck();
    await page.locator('[data-close-cv]').click();
  }

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.locator('[data-open-cv]').click();
  assert.equal(await page.locator('input[data-group="sections"][data-key="news"]').count(), 0);
  let pdfText = await downloadPdf('academic', true);
  assert.match(pdfText, /External Reviewer/);
  assert.match(pdfText, /ICCAD 2026/);
  assert(pdfText.includes('HESL, CCDS') && !pdfText.includes('SCSE'));
  assert.match(pdfText, /Hardware Accelerator for Feature Matching/);
  assert(!pdfText.includes('Nalanda College'));
  assert(!pdfText.includes('Cross Assembled Multi-quadrotor'));
  assert(pdfText.indexOf('RESEARCH FOCUS') < pdfText.indexOf('PROFESSIONAL EXPERIENCE'));
  assert(!pdfText.includes('scholar.google.com'));
  assert(!pdfText.includes('linkedin.com/in/'));
  const academic = pdfInspections.get('academic');
  assert.equal(academic.pageCount, 2, 'The default academic CV should occupy two well-spaced pages');
  assert(pdfText.includes('region-aware descriptor grouping'));
  assert(pdfText.includes('approximately 12x faster matching than linear exhaustive search on FPGA'));
  assert(pdfText.includes('FPL 2025 | First author'));
  assert(pdfText.includes('[1]') && pdfText.includes('[4]'));
  const dates = await page.locator('.cv-entry-date').allTextContents();
  assert(dates.length >= 7);
  for (const date of dates) {
    const expected = date.replace(/[\u2010-\u2015]/g, '-');
    const containingPage = academic.pages.find(items => items.some(item => item.str === expected));
    const item = containingPage?.find(item => item.str === expected);
    assert(item, `Missing date: ${date}`);
    assert(Math.abs(item.transform[4] + item.width - academic.firstPage.width + 48) < 2, `Right-align date: ${date}`);
    const title = containingPage.find(other => other !== item && Math.abs(other.transform[5] - item.transform[5]) < 0.1);
    assert(title && title.transform[4] + title.width + 8 < item.transform[4], `Keep the title separate from its date: ${date}`);
  }
  const { items, width: paperWidth } = academic.firstPage;
  for (const item of items.slice(0, 3)) {
    assert(Math.abs(item.transform[4] + item.width / 2 - paperWidth / 2) < 2, `CV header should be centered: ${item.str}`);
  }
  const contactLabels = ['Website', 'Google Scholar', 'LinkedIn', 'GitHub'];
  const contactItems = contactLabels.map(label => items.find(item => item.str === label));
  assert(contactItems.every(Boolean), 'Use short website/profile labels in the PDF');
  assert(contactItems.every(item => item.transform[5] === contactItems[0].transform[5]), 'PDF profile links should share a horizontal row');
  const firstLink = contactItems[0], lastLink = contactItems.at(-1);
  assert(Math.abs((firstLink.transform[4] + lastLink.transform[4] + lastLink.width) / 2 - paperWidth / 2) < 2, 'The PDF link row should be centered');
  const expectedContacts = await page.locator('.cv-contact-row a').evaluateAll(links => links.map(link => ({ label: link.textContent, url: link.href })));
  for (const contact of expectedContacts) {
    const item = items.find(item => item.str === contact.label);
    const annotation = academic.links.find(link => (link.url || link.unsafeUrl) === contact.url);
    assert(annotation, `Missing clickable PDF contact: ${contact.label}`);
    assert(Math.abs(annotation.rect[0] - item.transform[4]) < 1 && Math.abs(annotation.rect[2] - item.transform[4] - item.width) < 2, `Misaligned link target: ${contact.label}`);
  }
  const publicationUrls = await page.locator('.cv-entry-link').evaluateAll(links => links.map(link => link.href));
  assert(publicationUrls.length > 0);
  assert(publicationUrls.every(url => academic.links.some(link => (link.url || link.unsafeUrl) === url)), 'Publication titles remain clickable in a digital CV');

  // Print-friendly output keeps email text and publication content, but no PDF annotations.
  await page.locator('input[data-group="contacts"][data-key="personal"]').check();
  await page.locator('input[data-group="contacts"][data-key="github"]').uncheck();
  await page.locator('#cv-hyperlinks').uncheck();
  assert.equal(await page.locator('#cv-preview a').count(), 0);
  assert(await page.locator('input[data-group="contacts"][data-key="website"]').isDisabled());
  assert(await page.locator('input[data-group="contacts"][data-key="university"]').isEnabled());
  await audit();
  pdfText = await downloadPdf('print-academic', true);
  assert.deepEqual(pdfInspections.get('print-academic').links, []);
  assert(pdfText.includes('miyuruth001@e.ntu.edu.sg') && pdfText.includes('mthathsara@outlook.com'));
  assert(contactLabels.every(label => !pdfText.includes(label)));
  assert(pdfText.includes('Hardware Accelerator for Feature Matching'));
  assert(pdfText.includes('ICCAD 2026'));
  await page.reload();
  await page.locator('[data-open-cv]').click();
  assert(!await page.locator('#cv-hyperlinks').isChecked(), 'Remember the print setting');
  assert.equal(await page.locator('#cv-preview a').count(), 0);
  await page.locator('#cv-hyperlinks').check();
  assert(await page.locator('input[data-group="contacts"][data-key="website"]').isChecked());
  assert(!await page.locator('input[data-group="contacts"][data-key="github"]').isChecked(), 'Preserve individual excluded links');
  assert.equal(await page.locator('.cv-contact-row a').count(), 5);
  await page.locator('input[data-group="contacts"][data-key="github"]').check();
  await page.locator('input[data-group="contacts"][data-key="personal"]').uncheck();

  await page.locator('[data-section="publications"] summary').click();
  await page.locator('input[data-group="entries"][data-key*="Hardware Accelerator for Feature Matching"]').uncheck();
  await page.locator('input[data-group="contacts"][data-key="university"]').uncheck();
  pdfText = await downloadPdf('custom-academic');
  assert(!pdfText.includes('Hardware Accelerator for Feature Matching'));
  assert(pdfText.includes('Hardware-Efficient Homogenized'));
  assert(!pdfText.includes('miyuruth001@e.ntu.edu.sg'));
  // Existing saved selections created before the hyperlink setting remain compatible.
  await page.evaluate(() => {
    const key = 'miyuru-cv-options-v1';
    const saved = JSON.parse(localStorage.getItem(key));
    delete saved.hyperlinks;
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await page.locator('[data-open-cv]').click();
  assert(!await page.locator('input[data-group="contacts"][data-key="university"]').isChecked());
  assert(await page.locator('#cv-hyperlinks').isChecked());

  await page.locator('input[name="audience"][value="company"]').check();
  pdfText = await downloadPdf('company', true);
  assert.equal(pdfInspections.get('company').pageCount, 1, 'The default company CV should fit one page without a sparse continuation');
  assert(pdfText.includes('AXI DMA'));
  assert(pdfText.indexOf('PROFESSIONAL EXPERIENCE') < pdfText.indexOf('EDUCATION'));
  assert(!pdfText.includes('External Reviewer'));
  assert(!pdfText.includes('SELECTED PUBLICATIONS'));
  assert(!pdfText.includes('GPA:'));
  assert(pdfText.includes('First Class Honours'));
  assert(pdfText.includes('mthathsara@outlook.com'));

  for (const checkbox of await page.locator('input[data-group="sections"]').all()) await checkbox.check();
  await page.locator('#cv-selections details').evaluateAll(details => details.forEach(el => { el.open = true; }));
  for (const checkbox of await page.locator('input[data-group="entries"]').all()) await checkbox.check();
  await page.locator('#cv-grades').check();
  pdfText = await downloadPdf('all-sections');
  assert(pdfText.includes('Nalanda College'));
  assert(pdfText.includes('Acknowledged contributor'));
  assert(pdfText.includes('Chess'));
  assert(pdfText.includes('ICCAD 2026'));
  assert(pdfText.includes('Acknowledged contribution to prototype development'));
  await page.locator('#cv-descriptions').uncheck();
  const withoutDescriptions = await downloadPdf('all-sections-no-descriptions');
  assert(withoutDescriptions.includes('Hardware Accelerator for Feature Matching'));
  assert(!withoutDescriptions.includes('region-aware descriptor grouping'));
  assert(!withoutDescriptions.includes('Acknowledged contribution to prototype development'));

  for (const checkbox of await page.locator('input[data-group="sections"]').all()) await checkbox.uncheck();
  assert(await page.locator('#cv-download').isDisabled());
  assert.match(await page.locator('#cv-status').innerText(), /Select at least one/);
  await page.locator('#cv-reset').click();
  await page.locator('#cv-descriptions').uncheck();
  pdfText = await downloadPdf('concise-company');
  assert(pdfText.includes('Project Officer'));
  assert(!pdfText.includes('Contributed partial reconfiguration'));
  for (const checkbox of await page.locator('input[data-group="contacts"]').all()) await checkbox.uncheck();
  assert.equal(await page.locator('.cv-contact-row').count(), 0, 'Do not leave empty contact rows');
  pdfText = await downloadPdf('no-contacts');
  assert.deepEqual(pdfInspections.get('no-contacts').links, []);
  assert(!pdfText.includes('mthathsara@outlook.com'));
  assert.deepEqual(pageErrors, []);

  // Touch-sized viewport and blocked browser storage must still allow a PDF download.
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mobileContext.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } });
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(base);
  await mobilePage.locator('[data-open-cv]').tap();
  const [mobileDownload] = await Promise.all([mobilePage.waitForEvent('download'), mobilePage.locator('#cv-download').tap()]);
  assert(mobileDownload.suggestedFilename().endsWith('.pdf'));
  await mobileContext.close();

  // A failed first library request must be recoverable without reloading the page.
  const retryContext = await browser.newContext();
  const retryPage = await retryContext.newPage();
  await retryPage.route('**/assets/vendor/jspdf.umd.min.js', route => route.abort());
  await retryPage.goto(base);
  await retryPage.locator('[data-open-cv]').click();
  await retryPage.locator('#cv-download').click();
  await retryPage.getByText('The PDF could not be generated.', { exact: false }).waitFor();
  await retryPage.unroute('**/assets/vendor/jspdf.umd.min.js');
  const [retryDownload] = await Promise.all([retryPage.waitForEvent('download'), retryPage.locator('#cv-download').click()]);
  assert(retryDownload.suggestedFilename().endsWith('.pdf'));
  await retryContext.close();
  console.log('PASS: centered mobile navigation, name before photo, News exclusion, separate paper descriptions, PDF typography and dates, image zoom, keyboard focus, CV presets, selection, persistence, centered headers, horizontal links, print option, empty state, PDF downloads, retry, and accessibility');
  console.log(`Artifacts: ${artifacts}`);
} finally {
  await browser.close();
  server.close();
}
