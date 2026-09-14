// Text-based A4 output; this module has no DOM dependencies.
export function createCvPdf(jsPDF, model) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const width = pageWidth - margin * 2;
  const bottom = pageHeight - 50;
  const ink = [32, 42, 48];
  const navy = [24, 59, 78];
  const muted = [80, 91, 98];
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

  function paragraph(value, { font = 'times', style = 'normal', size = 10.5, color = ink, after = 5, url, align = 'left' } = {}) {
    const text = clean(value);
    if (!text) return;
    pdf.setFont(font, style).setFontSize(size);
    const lines = pdf.splitTextToSize(text, width);
    const lineHeight = size * 1.35;
    for (const line of lines) {
      ensure(lineHeight);
      pdf.setFont(font, style).setFontSize(size).setTextColor(...color);
      const textWidth = Math.min(width, pdf.getTextWidth(line));
      const x = align === 'center' ? (pageWidth - textWidth) / 2 : margin;
      pdf.text(line, x, y + size);
      if (url) pdf.link(x, y, textWidth, lineHeight, { url });
      y += lineHeight;
    }
    y += after;
  }

  function entryStartHeight(item) {
    pdf.setFont('times', 'bold').setFontSize(11);
    const title = item.title ? pdf.splitTextToSize(clean(item.title), width).length * 15 : 0;
    pdf.setFont('helvetica', 'normal').setFontSize(8.5);
    const meta = item.meta ? pdf.splitTextToSize(clean(item.meta), width).length * 12 : 0;
    return title + meta + (item.paragraphs.length ? 30 : 8);
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

  paragraph(model.name, { size: 27, color: navy, after: 4, align: 'center' });
  paragraph(model.headline, { font: 'helvetica', size: 9.5, after: 9, align: 'center' });
  contactRows(model.contacts.filter(contact => contact.kind === 'email'));
  contactRows(model.contacts.filter(contact => contact.kind === 'web'));
  y += 7;

  for (const section of model.sections) {
    // Reserve room for the section title and the start of its first entry.
    ensure(34 + entryStartHeight(section.items[0]));
    y += 8;
    paragraph(section.title.toUpperCase(), { font: 'helvetica', style: 'bold', size: 10, color: navy, after: 4 });
    pdf.setDrawColor(184, 193, 198).setLineWidth(0.5).line(margin, y, pageWidth - margin, y);
    y += 9;
    for (const item of section.items) {
      ensure(entryStartHeight(item));
      if (item.title) paragraph(item.title, { style: 'bold', size: 11, after: 2, url: item.url });
      if (item.meta) paragraph(item.meta, { font: 'helvetica', size: 8.5, color: muted, after: 4 });
      item.paragraphs.forEach(value => paragraph(value));
      y += item.title ? 6 : 2;
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
