// Text-based A4 output; this module has no DOM dependencies.
export function createCvPdf(jsPDF, model) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const width = pageWidth - margin * 2;
  const bottom = pageHeight - 50;
  const ink = [36, 39, 43];
  const navy = [24, 59, 78];
  const muted = [80, 86, 92];
  let y = margin;
  const clean = value => String(value).normalize('NFC').replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\u00a0/g, ' ').replace(/\u2197/g, '').replace(/\u00d7/g, 'x');

  pdf.setProperties({ title: `${model.name} - ${model.audience === 'company' ? 'Professional' : 'Academic'} CV`, author: model.name, subject: 'Curriculum Vitae', creator: 'Miyuru Thathsara Personal Profile' });
  pdf.setLanguage('en');

  function newPage() {
    pdf.addPage();
    pdf.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...muted);
    pdf.text(clean(model.name), margin, 28);
    pdf.text('Curriculum Vitae', pageWidth - margin, 28, { align: 'right' });
    y = margin;
  }

  function ensure(height) {
    if (y + height > bottom) newPage();
  }

  function paragraph(value, { style = 'normal', size = 10, color = ink, after = 3, url, align = 'left', indent = 0, maxWidth = width - indent, bullet = false } = {}) {
    const text = clean(value);
    if (!text) return;
    pdf.setFont('helvetica', style).setFontSize(size);
    const lines = pdf.splitTextToSize(text, maxWidth);
    const lineHeight = size * 1.3;
    for (const [index, line] of lines.entries()) {
      ensure(lineHeight);
      pdf.setFont('helvetica', style).setFontSize(size).setTextColor(...color);
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
    pdf.setFont('helvetica', style).setFontSize(size);
    return pdf.splitTextToSize(clean(value), maxWidth).length * size * 1.3;
  }

  function entryLayout(item) {
    const indent = item.number ? 22 : 0;
    pdf.setFont('helvetica', 'normal').setFontSize(9);
    const dateWidth = item.date ? pdf.getTextWidth(clean(item.date)) + 16 : 0;
    const titleWidth = width - indent - dateWidth;
    const titleHeight = item.title ? textHeight(item.title, 10.5, 'bold', titleWidth) + 2 : 0;
    const metaHeight = item.meta ? textHeight(item.meta, 9, 'normal', width - indent) + 3 : 0;
    const bodyHeight = item.paragraphs.reduce((height, value) => height + textHeight(value, 10, 'normal', width - indent - (item.bullets ? 10 : 0)) + 3, 0);
    return { indent, titleWidth, height: titleHeight + metaHeight + bodyHeight + (item.title ? 7 : 0), startHeight: titleHeight + metaHeight + (bodyHeight ? 26 : 0) };
  }

  function reserveEntry(item) {
    const layout = entryLayout(item);
    // Keep normal CV entries together. Very long future entries can flow across pages.
    return layout.height <= bottom - margin - 32 ? layout.height : layout.startHeight;
  }

  function contactRows(contacts) {
    const size = 8.5;
    const gap = 16;
    const lineHeight = size * 1.6;
    pdf.setFont('helvetica', 'normal').setFontSize(size);
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
        pdf.setFont('helvetica', 'normal').setFontSize(size).setTextColor(...(item.url ? navy : muted));
        pdf.text(item.label, x, y + size);
        if (item.url) {
          pdf.link(x, y, item.width, lineHeight, { url: item.url });
          pdf.setDrawColor(...navy).setLineWidth(0.3).line(x, y + size + 1.5, x + item.width, y + size + 1.5);
        }
        x += item.width + gap;
      }
      y += lineHeight;
    }
  }

  paragraph(model.name, { size: 23, style: 'bold', after: 3, align: 'center' });
  paragraph(model.headline, { size: 9.5, after: 7, align: 'center' });
  contactRows(model.contacts.filter(contact => contact.kind === 'email'));
  contactRows(model.contacts.filter(contact => contact.kind === 'web'));
  y += 6;

  for (const section of model.sections) {
    if (!section.items.length) continue;
    ensure(32 + reserveEntry(section.items[0]));
    y += 8;
    paragraph(section.title.toUpperCase(), { style: 'bold', size: 9.5, after: 4 });
    pdf.setDrawColor(170, 176, 181).setLineWidth(0.5).line(margin, y, pageWidth - margin, y);
    y += 6;
    for (const item of section.items) {
      ensure(reserveEntry(item));
      const { indent, titleWidth } = entryLayout(item);
      if (item.number) {
        pdf.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...ink);
        pdf.text(`[${item.number}]`, margin, y + 10.5);
      }
      if (item.date) {
        pdf.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...muted);
        pdf.text(clean(item.date), pageWidth - margin, y + 10.5, { align: 'right' });
      }
      if (item.title) paragraph(item.title, { style: 'bold', size: 10.5, after: 2, url: item.url, indent, maxWidth: titleWidth });
      if (item.meta) paragraph(item.meta, { size: 9, color: muted, indent });
      item.paragraphs.forEach(value => paragraph(value, { indent: indent + (item.bullets ? 10 : 0), bullet: item.bullets }));
      y += item.title ? 7 : 0;
    }
  }

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    pdf.setDrawColor(205, 211, 214).setLineWidth(0.5).line(margin, pageHeight - 36, pageWidth - margin, pageHeight - 36);
    pdf.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...muted);
    pdf.text(clean(model.name), margin, pageHeight - 22);
    pdf.text(`${page} / ${pages}`, pageWidth - margin, pageHeight - 22, { align: 'right' });
  }
  return pdf;
}
