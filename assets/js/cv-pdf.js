// One reference-style A4 template for both audiences; only their content differs.
export function createCvPdf(jsPDF, model, fonts) {
  const academic = model.audience === 'academia';
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true, putOnlyUsedFonts: true });
  if (fonts?.length !== 3 || fonts.some(font => !font)) throw new Error('CV fonts are unavailable.');
  for (const [index, style] of ['normal', 'bold', 'italic'].entries()) {
    const file = `CMUSerif-${style}.ttf`;
    pdf.addFileToVFS(file, fonts[index]);
    pdf.addFont(file, 'CMUSerif', style);
  }
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 42.52;
  const width = pageWidth - margin * 2;
  const bottom = pageHeight - 50;
  const family = 'CMUSerif';
  const bodySize = 10.8;
  const titleSize = 10.8;
  const metaSize = 10.8;
  const dateSize = 10.5;
  const ink = [20, 20, 20];
  const linkColor = [0, 0, 180];
  const muted = ink;
  const entryGap = 6;
  let y = 30;
  const clean = value => String(value).normalize('NFC').replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\u00a0/g, ' ').replace(/\u2197/g, '').replace(/\u00d7/g, 'x');

  pdf.setProperties({ title: `${model.name} - ${academic ? 'Academic' : 'Professional'} CV`, author: model.name, subject: 'Curriculum Vitae', creator: 'Miyuru Thathsara CV Generator' });
  pdf.setLanguage('en');

  function newPage() {
    pdf.addPage();
    pdf.setFont(family, 'normal').setFontSize(8).setTextColor(...muted);
    pdf.text(clean(model.name), margin, 28);
    pdf.text('Curriculum Vitae', pageWidth - margin, 28, { align: 'right' });
    y = margin;
  }

  function ensure(height) {
    if (y + height > bottom + 0.001) newPage();
  }

  function paragraph(value, { style = 'normal', size = bodySize, color = ink, after = 2, url, align = 'left', indent = 0, maxWidth = width - indent, bullet = false } = {}) {
    const text = clean(value);
    if (!text) return;
    pdf.setFont(family, style).setFontSize(size);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = size * 1.25;
    let index = 0;
    while (index < lines.length) {
      const remaining = lines.length - index;
      let available = Math.max(0, Math.floor((bottom - y + 0.001) / lineHeight));
      if (remaining > available) {
        // Flow into the remaining space, with at least two lines on each side
        // of a paragraph break. One- to three-line paragraphs stay together.
        if (remaining - available === 1) available--;
        if (available < 2) { newPage(); continue; }
      }
      const count = Math.min(remaining, available);
      for (let offset = 0; offset < count; offset++, index++) {
        const line = lines[index];
        pdf.setFont(family, style).setFontSize(size).setTextColor(...color);
        const textWidth = Math.min(maxWidth, pdf.getTextWidth(line));
        const x = align === 'center' ? (pageWidth - textWidth) / 2 : margin + indent;
        if (bullet && index === 0) pdf.text('•', x - 10, y + size);
        pdf.text(line, x, y + size);
        if (url) pdf.link(x, y, textWidth, lineHeight, { url });
        y += lineHeight;
      }
      if (index < lines.length) newPage();
    }
    y += after;
  }

  function textHeight(value, size, style, maxWidth) {
    if (!value) return 0;
    pdf.setFont(family, style).setFontSize(size);
    return pdf.splitTextToSize(clean(value), maxWidth).length * size * 1.25;
  }

  function entryLayout(item) {
    const indent = item.number ? 22 : 0;
    pdf.setFont(family, 'italic').setFontSize(dateSize);
    const dateWidth = item.date ? pdf.getTextWidth(clean(item.date)) + 16 : 0;
    const titleWidth = width - indent - dateWidth;
    const titleHeight = item.title ? textHeight(item.title, titleSize, 'bold', titleWidth) : 0;
    const metaHeight = item.meta ? textHeight(item.meta, metaSize, 'normal', width - indent) + 2 : 0;
    const firstParagraph = item.paragraphs.find(value => value.trim());
    const firstBodyHeight = textHeight(firstParagraph, bodySize, 'normal', width - indent - (item.bullets ? 10 : 0));
    const bodyStartHeight = firstBodyHeight > bodySize * 1.25 * 3 ? bodySize * 1.25 * 2 : firstBodyHeight;
    // Keep the title, metadata, and beginning of the description together.
    // Remaining paragraphs can flow instead of moving the entire entry.
    return { indent, titleWidth, startHeight: titleHeight + metaHeight + bodyStartHeight };
  }

  function contactRows(contacts) {
    const size = 10;
    const gap = 16;
    const lineHeight = size * 1.4;
    pdf.setFont(family, 'normal').setFontSize(size);
    const rows = [];
    let row = [], rowWidth = 0;
    for (const contact of contacts) {
      // Wrap only between labels unless a single label itself exceeds the page width.
      for (const label of pdf.splitTextToSize(clean(contact.text), width)) {
        const textWidth = pdf.getTextWidth(label);
        if (row.length && rowWidth + gap + textWidth > width) {
          rows.push({ items: row, width: rowWidth });
          row = []; rowWidth = 0;
        }
        rowWidth += (row.length ? gap : 0) + textWidth;
        row.push({ label, width: textWidth, url: contact.url });
      }
    }
    if (row.length) rows.push({ items: row, width: rowWidth });
    for (const row of rows) {
      ensure(lineHeight);
      let x = (pageWidth - row.width) / 2;
      for (const item of row.items) {
        pdf.setFont(family, 'normal').setFontSize(size).setTextColor(...(item.url ? linkColor : muted));
        pdf.text(item.label, x, y + size);
        if (item.url) {
          pdf.link(x, y, item.width, lineHeight, { url: item.url });
        }
        x += item.width + gap;
      }
      y += lineHeight;
    }
  }

  paragraph(model.name, { size: 18.5, style: 'bold', after: 3, align: 'center' });
  paragraph(model.affiliation, { size: 9.5, after: 4, align: 'center' });
  // Wrap between complete topics, keeping separators away from line boundaries.
  pdf.setFont(family, 'normal').setFontSize(9.5);
  const topicRows = [];
  let topicRow = '';
  for (const topic of model.topics) {
    const candidate = topicRow ? `${topicRow} | ${topic}` : topic;
    if (topicRow && pdf.getTextWidth(clean(candidate)) > width) {
      topicRows.push(topicRow);
      topicRow = topic;
    } else topicRow = candidate;
  }
  if (topicRow) topicRows.push(topicRow);
  paragraph(topicRows.join('\n'), { size: 9.5, after: 4, align: 'center' });
  contactRows(model.contacts.filter(contact => contact.kind === 'email'));
  contactRows(model.contacts.filter(contact => contact.kind === 'web'));
  y += 6;

  for (const section of model.sections) {
    if (!section.items.length) continue;
    // Reserve the section heading and the start of its first entry only.
    ensure(26 + entryLayout(section.items[0]).startHeight);
    y += 7;
    // Optical small caps, like the reference's LaTeX section headings.
    let x = margin;
    for (const word of clean(section.title).split(' ')) {
      for (const [part, size] of [[word.slice(0, 1).toUpperCase(), 12], [word.slice(1).toUpperCase(), 10]]) {
        pdf.setFont(family, 'normal').setFontSize(size).setTextColor(...ink);
        pdf.text(part, x, y + 12);
        x += pdf.getTextWidth(part);
      }
      x += 3;
    }
    y += 15;
    pdf.setDrawColor(...ink).setLineWidth(0.5).line(margin, y, pageWidth - margin, y);
    y += 4;
    for (const item of section.items) {
      const { indent, titleWidth, startHeight } = entryLayout(item);
      ensure(startHeight);
      if (item.number) {
        pdf.setFont(family, 'normal').setFontSize(bodySize).setTextColor(...ink);
        pdf.text(`[${item.number}]`, margin, y + titleSize);
      }
      if (item.date) {
        pdf.setFont(family, 'italic').setFontSize(dateSize).setTextColor(...muted);
        pdf.text(clean(item.date), pageWidth - margin, y + titleSize, { align: 'right' });
      }
      if (item.title) paragraph(item.title, { style: 'bold', size: titleSize, after: 0, url: item.url, indent, maxWidth: titleWidth });
      if (item.meta) paragraph(item.meta, { size: metaSize, color: muted, indent });
      item.paragraphs.forEach(value => paragraph(value, { indent: indent + (item.bullets ? 10 : 0), bullet: item.bullets }));
      y += item.title ? entryGap : 0;
    }
  }

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    pdf.setFont(family, 'normal').setFontSize(8).setTextColor(...muted);
    pdf.text(clean(model.name), margin, pageHeight - 22);
    pdf.text(`${page} / ${pages}`, pageWidth - margin, pageHeight - 22, { align: 'right' });
  }
  return pdf;
}
