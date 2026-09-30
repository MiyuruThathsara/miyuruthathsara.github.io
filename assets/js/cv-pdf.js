// Shared, text-based A4 layout. Academia follows the supplied LaTeX-style reference;
// Company uses the same straightforward reading order with plain sans-serif type.
export function createCvPdf(jsPDF, model, fonts) {
  const academic = model.audience === 'academia';
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true, putOnlyUsedFonts: true });
  if (academic) {
    if (fonts?.length !== 3 || fonts.some(font => !font)) throw new Error('Academic fonts are unavailable.');
    for (const [index, style] of ['normal', 'bold', 'italic'].entries()) {
      const file = `CMUSerif-${style}.ttf`;
      pdf.addFileToVFS(file, fonts[index]);
      pdf.addFont(file, 'CMUSerif', style);
    }
  }
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = academic ? 42.52 : 48;
  const width = pageWidth - margin * 2;
  const bottom = pageHeight - 50;
  const family = academic ? 'CMUSerif' : 'helvetica';
  const bodySize = academic ? 10.8 : 10;
  const titleSize = academic ? 10.8 : 10.5;
  const metaSize = academic ? 10.8 : 9.4;
  const dateSize = academic ? 10.5 : 9;
  const ink = [20, 20, 20];
  const linkColor = academic ? [0, 0, 180] : ink;
  const muted = academic ? ink : [65, 65, 65];
  const entryGap = academic ? 6 : 5;
  let y = academic ? 30 : 38;
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
    if (y + height > bottom) newPage();
  }

  function paragraph(value, { style = 'normal', size = bodySize, color = ink, after = 2, url, align = 'left', indent = 0, maxWidth = width - indent, bullet = false } = {}) {
    const text = clean(value);
    if (!text) return;
    pdf.setFont(family, style).setFontSize(size);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = size * 1.25;
    for (const [index, line] of lines.entries()) {
      ensure(lineHeight);
      pdf.setFont(family, style).setFontSize(size).setTextColor(...color);
      const textWidth = Math.min(maxWidth, pdf.getTextWidth(line));
      const x = align === 'center' ? (pageWidth - textWidth) / 2 : margin + indent;
      if (bullet && index === 0) pdf.text('•', x - 10, y + size);
      pdf.text(line, x, y + size);
      if (url) pdf.link(x, y, textWidth, lineHeight, { url });
      y += lineHeight;
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
    pdf.setFont(family, academic ? 'italic' : 'normal').setFontSize(dateSize);
    const dateWidth = item.date ? pdf.getTextWidth(clean(item.date)) + 16 : 0;
    const titleWidth = width - indent - dateWidth;
    const titleHeight = item.title ? textHeight(item.title, titleSize, 'bold', titleWidth) : 0;
    const metaHeight = item.meta ? textHeight(item.meta, metaSize, 'normal', width - indent) + 2 : 0;
    const bodyHeight = item.paragraphs.reduce((height, value) => height + textHeight(value, bodySize, 'normal', width - indent - (item.bullets ? 10 : 0)) + 2, 0);
    return { indent, titleWidth, height: titleHeight + metaHeight + bodyHeight + (item.title ? entryGap : 0), startHeight: titleHeight + metaHeight + (bodyHeight ? 26 : 0) };
  }

  function reserveEntry(item) {
    const layout = entryLayout(item);
    // Keep normal CV entries together. Very long future entries can flow across pages.
    return layout.height <= bottom - margin - 32 ? layout.height : layout.startHeight;
  }

  function contactRows(contacts) {
    const size = academic ? 10 : 9;
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
          if (!academic) pdf.setDrawColor(...muted).setLineWidth(0.3).line(x, y + size + 1.5, x + item.width, y + size + 1.5);
        }
        x += item.width + gap;
      }
      y += lineHeight;
    }
  }

  paragraph(model.name, { size: academic ? 18.5 : 22, style: 'bold', after: 3, align: 'center' });
  paragraph(model.headline, { size: 9.5, after: 4, align: 'center' });
  contactRows(model.contacts.filter(contact => contact.kind === 'email'));
  contactRows(model.contacts.filter(contact => contact.kind === 'web'));
  y += 6;

  for (const section of model.sections) {
    if (!section.items.length) continue;
    ensure(28 + reserveEntry(section.items[0]));
    y += 7;
    if (academic) {
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
    } else paragraph(section.title.toUpperCase(), { style: 'bold', size: 9.5, after: 2 });
    pdf.setDrawColor(...(academic ? ink : [150, 150, 150])).setLineWidth(0.5).line(margin, y, pageWidth - margin, y);
    y += 4;
    for (const item of section.items) {
      ensure(reserveEntry(item));
      const { indent, titleWidth } = entryLayout(item);
      if (item.number) {
        pdf.setFont(family, 'normal').setFontSize(bodySize).setTextColor(...ink);
        pdf.text(`[${item.number}]`, margin, y + titleSize);
      }
      if (item.date) {
        pdf.setFont(family, academic ? 'italic' : 'normal').setFontSize(dateSize).setTextColor(...muted);
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
