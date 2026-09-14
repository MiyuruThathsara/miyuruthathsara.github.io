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
page.on('pageerror', error => pageErrors.push(error.message));

async function audit() {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), []);
}

async function readPdf(bytes, name, render = false) {
  const task = getDocument({ data: new Uint8Array(bytes), standardFontDataUrl: resolve('node_modules/pdfjs-dist/standard_fonts') + sep });
  const pdf = await task.promise;
  let text = '';
  for (let number = 1; number <= pdf.numPages; number++) {
    const pdfPage = await pdf.getPage(number);
    const viewport = pdfPage.getViewport({ scale: 1 });
    const content = await pdfPage.getTextContent();
    const items = content.items.filter(item => item.str?.trim());
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
  for (const width of [1440, 1024, 768, 390, 320]) {
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
    for (const figure of await page.locator('.publication-media').all()) {
      const bounds = await figure.boundingBox();
      assert(bounds.width <= 240 && bounds.height <= 215, 'Publication previews should remain compact');
    }
    if ([1440, 390].includes(width)) {
      await page.evaluate(() => scrollTo(0, 0));
      await audit();
      await page.screenshot({ path: join(artifacts, `profile-${width}.png`) });
      await page.locator('.publication').nth(2).screenshot({ path: join(artifacts, `diagram-${width}.png`) });
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
    assert(await page.locator('#cv-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `CV overflow at ${width}`);
    const downloadBounds = await page.locator('#cv-download').boundingBox();
    assert(downloadBounds.y + downloadBounds.height <= 1100, `Download button not reachable at ${width}`);
    await audit();
    await page.screenshot({ path: join(artifacts, `builder-${width}.png`) });
    await page.locator('[data-close-cv]').click();
  }

  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.locator('[data-open-cv]').click();
  let pdfText = await downloadPdf('academic', true);
  assert.match(pdfText, /External Reviewer/);
  assert.match(pdfText, /ICCAD 2026/);
  assert.match(pdfText, /Hardware Accelerator for Feature Matching/);
  assert(!pdfText.includes('Nalanda College'));
  assert(!pdfText.includes('Cross Assembled Multi-quadrotor'));
  assert(pdfText.indexOf('RESEARCH FOCUS') < pdfText.indexOf('PROFESSIONAL EXPERIENCE'));

  await page.locator('[data-section="publications"] summary').click();
  await page.locator('input[data-group="entries"][data-key*="Hardware Accelerator for Feature Matching"]').uncheck();
  await page.locator('input[data-group="contacts"][data-key="university"]').uncheck();
  pdfText = await downloadPdf('custom-academic');
  assert(!pdfText.includes('Hardware Accelerator for Feature Matching'));
  assert(pdfText.includes('Hardware-Efficient Homogenized'));
  assert(!pdfText.includes('miyuruth001@e.ntu.edu.sg'));
  await page.reload();
  await page.locator('[data-open-cv]').click();
  assert(!await page.locator('input[data-group="contacts"][data-key="university"]').isChecked());

  await page.locator('input[name="audience"][value="company"]').check();
  pdfText = await downloadPdf('company', true);
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

  for (const checkbox of await page.locator('input[data-group="sections"]').all()) await checkbox.uncheck();
  assert(await page.locator('#cv-download').isDisabled());
  assert.match(await page.locator('#cv-status').innerText(), /Select at least one/);
  await page.locator('#cv-reset').click();
  await page.locator('#cv-descriptions').uncheck();
  pdfText = await downloadPdf('concise-company');
  assert(pdfText.includes('Project Officer'));
  assert(!pdfText.includes('Contributed partial reconfiguration'));
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
  console.log('PASS: image zoom, keyboard focus, CV presets, selection, persistence, empty state, PDF downloads, retry, and accessibility');
  console.log(`Artifacts: ${artifacts}`);
} finally {
  await browser.close();
  server.close();
}
