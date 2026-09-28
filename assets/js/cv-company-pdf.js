// Circuit / C++: vector artwork, embedded type, and two independently flowing columns.
const railSections = new Set(['expertise', 'education', 'awards', 'earlier', 'interests']);
export const sectionCode = id => ({
  summary: '// profile.hpp', highlights: '// measured / integrated', experience: '// experience.cpp',
  publications: '// publications.hpp', research: '// research.cpp', review: '// academic_service.hpp',
  contributions: '// contributions.cpp', expertise: '// capabilities.hpp', education: '// education.hpp',
  awards: '// recognition.hpp', earlier: '// foundations.hpp', interests: '// beyond_work.hpp'
}[id] || '// curriculum_vitae');

export function companyLayout(model) {
  return {
    top: model.sections.filter(section => ['summary', 'highlights'].includes(section.id)),
    primary: model.sections.filter(section => !railSections.has(section.id) && !['summary', 'highlights'].includes(section.id)),
    sidebar: model.sections.filter(section => railSections.has(section.id))
  };
}

export function createCompanyPdf(jsPDF, model, fonts) {
  if (!fonts?.[0] || !fonts?.[1]) throw new Error('The engineering template requires its embedded fonts.');
  const pdf = new jsPDF({ unit: 'pt', format: 'a4', compress: true, putOnlyUsedFonts: true });
  for (const [index, style] of ['normal', 'bold'].entries()) {
    const file = `JetBrainsMono-${style}.ttf`;
    pdf.addFileToVFS(file, fonts[index]);
    pdf.addFont(file, 'JetBrainsMono', style);
  }
  pdf.setProperties({ title: `${model.name} - Professional CV`, author: model.name, subject: 'Embedded intelligence and hardware acceleration', creator: 'Miyuru Thathsara CV Generator' });
  pdf.setLanguage('en');
  const W = pdf.internal.pageSize.getWidth(), H = pdf.internal.pageSize.getHeight();
  const M = 42, width = W - M * 2, bottom = H - 48;
  const ink = [26, 42, 55], muted = [75, 93, 104], teal = [0, 104, 106];
  const cyan = [136, 224, 213], paper = [243, 248, 249], rule = [207, 222, 224];
  const codeFont = 'JetBrainsMono';
  const clean = value => String(value ?? '').normalize('NFC').replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\u00a0/g, ' ').replace(/\u00d7/g, 'x');
  function font(size = 9.4, style = 'normal', mono = false, color = ink) {
    pdf.setFont(mono ? codeFont : 'helvetica', style).setFontSize(size).setTextColor(...color);
  }
  function lines(value, maxWidth, size = 9.4, style = 'normal', mono = false) {
    font(size, style, mono);
    return pdf.splitTextToSize(clean(value), maxWidth);
  }
  function text(value, x, y, size = 9.4, { style = 'normal', mono = false, color = ink, align = 'left', url } = {}) {
    font(size, style, mono, color);
    const label = clean(value);
    pdf.text(label, x, y, { align });
    if (url) {
      const textWidth = pdf.getTextWidth(label);
      pdf.link(x - (align === 'center' ? textWidth / 2 : align === 'right' ? textWidth : 0), y - size, textWidth, size * 1.4, { url });
    }
  }

  // Source-file tab and mirrored circuit traces frame, rather than obscure, the name.
  pdf.setFillColor(...ink).rect(M, 38, width, 104, 'F');
  pdf.setFillColor(15, 29, 40).rect(M, 38, width, 24, 'F');
  text('C++', M + 12, 53, 8, { mono: true, style: 'bold', color: cyan });
  text('miyuru_thathsara.cpp', M + 40, 53, 8, { mono: true, color: [223, 237, 241] });
  text('namespace miyuru {', W / 2, 79, 8, { mono: true, color: cyan, align: 'center' });
  for (const mirrored of [false, true]) {
    const x = value => mirrored ? W - M - value : M + value;
    pdf.setDrawColor(77, 134, 142).setLineWidth(0.7);
    for (const [offset, end] of [[80, 58], [108, 42], [131, 65]]) {
      pdf.line(x(0), offset, x(end - 14), offset);
      pdf.line(x(end - 14), offset, x(end - 5), offset - 9);
      pdf.line(x(end - 5), offset - 9, x(end + 6), offset - 9);
      pdf.setFillColor(...ink).circle(x(end + 8), offset - 9, 2, 'FD');
    }
    // Small digital gate with input traces and an output pin.
    const gateX = x(17), gateY = 95, direction = mirrored ? -1 : 1;
    pdf.lines([[10 * direction, 0], [5 * direction, 6], [-5 * direction, 6], [-10 * direction, 0], [0, -12]], gateX, gateY);
    pdf.line(gateX - 8 * direction, gateY + 3, gateX, gateY + 3);
    pdf.line(gateX - 8 * direction, gateY + 9, gateX, gateY + 9);
    pdf.line(gateX + 15 * direction, gateY + 6, gateX + 23 * direction, gateY + 6);
  }
  text(model.name, W / 2, 106, 24, { mono: true, style: 'bold', color: [255, 255, 255], align: 'center' });
  text(model.headline, W / 2, 126, 9, { mono: true, color: [223, 237, 241], align: 'center' });

  let y = 153;
  for (const kind of ['email', 'web']) {
    const rows = []; let row = [], rowWidth = 0;
    for (const contact of model.contacts.filter(contact => contact.kind === kind)) {
      for (const label of lines(contact.text, width, 8, 'normal', true)) {
        font(8, 'normal', true);
        const length = pdf.getTextWidth(label);
        if (row.length && rowWidth + 16 + length > width) { rows.push({ row, width: rowWidth }); row = []; rowWidth = 0; }
        rowWidth += (row.length ? 16 : 0) + length;
        row.push({ label, length, url: contact.url });
      }
    }
    if (row.length) rows.push({ row, width: rowWidth });
    for (const { row, width: rowWidth } of rows) {
      let x = (W - rowWidth) / 2;
      for (const contact of row) {
        text(contact.label, x, y, 8, { mono: true, color: contact.url ? teal : muted, url: contact.url });
        if (contact.url) pdf.setDrawColor(...rule).setLineWidth(0.5).line(x, y + 2, x + contact.length, y + 2);
        x += contact.length + 16;
      }
      y += 13;
    }
  }
  y += 7;
  const layout = companyLayout(model);
  for (const section of layout.top) {
    if (section.id === 'summary') {
      for (const item of section.items) for (const value of item.paragraphs) {
        for (const line of lines(value, width, 10)) { text(line, M, y + 10, 10); y += 13.4; }
      }
      y += 12;
    } else {
      text('ENGINEERING RESULTS', M, y + 8, 8, { mono: true, style: 'bold', color: teal });
      y += 18;
      const gap = 9, cardWidth = (width - gap * (section.items.length - 1)) / section.items.length;
      const cardHeight = Math.max(...section.items.map(item => 47 + lines(item.paragraphs.join(' '), cardWidth - 20, 8.4).length * 10.6));
      section.items.forEach((item, index) => {
        const x = M + index * (cardWidth + gap);
        pdf.setFillColor(...paper).setDrawColor(...rule).setLineWidth(0.5).rect(x, y, cardWidth, cardHeight, 'FD');
        pdf.setFillColor(...teal).rect(x, y, 2, cardHeight, 'F');
        text(item.label, x + 10, y + 13, 7.4, { mono: true, color: muted });
        text(item.value, x + 10, y + 35, 18, { mono: true, style: 'bold', color: teal });
        lines(item.paragraphs.join(' '), cardWidth - 20, 8.4).forEach((line, i) => text(line, x + 10, y + 49 + i * 10.6, 8.4, { color: muted }));
      });
      y += cardHeight + 20;
    }
  }

  const bodyTop = y, twoColumns = layout.primary.length > 0 && layout.sidebar.length > 0;
  const railWidth = 182, gap = 22, mainWidth = width - railWidth - gap;
  const railX = M + mainWidth + gap;
  function pageFrame(page) {
    if (page > 1) {
      text(model.name, M, 28, 9, { mono: true, style: 'bold' });
      text('// curriculum_vitae', W - M, 28, 8, { mono: true, color: teal, align: 'right' });
      pdf.setDrawColor(...rule).setLineWidth(0.5).line(M, 37, W - M, 37);
    }
    if (twoColumns) pdf.setDrawColor(...rule).setLineWidth(0.5).line(railX - gap / 2, page === 1 ? bodyTop : 52, railX - gap / 2, bottom);
  }
  pageFrame(1);

  function renderColumn(sections, x, columnWidth, rail) {
    let page = 1, cursor = bodyTop, currentSection;
    const bodySize = rail ? 9 : 9.4;
    const lineHeight = bodySize * 1.3;
    pdf.setPage(page);
    function nextPage(continued) {
      page += 1;
      if (page > pdf.getNumberOfPages()) { pdf.addPage(); pageFrame(page); }
      else pdf.setPage(page);
      cursor = 52;
      if (continued && currentSection) heading(currentSection, true);
    }
    function ensure(height, continued = true) { if (cursor + height > bottom) nextPage(continued); }
    function heading(section, continued = false) {
      text(sectionCode(section.id), x, cursor + 7, 7, { mono: true, color: muted });
      cursor += 13;
      for (const line of lines(`${section.title.toUpperCase()}${continued ? ' / CONT.' : ''}`, columnWidth - 15, 8.8, 'bold', true)) {
        text(line, x, cursor + 8.8, 8.8, { mono: true, style: 'bold', color: teal });
        cursor += 12;
      }
      text('{', x + columnWidth - 7, cursor - 3.2, 10, { mono: true, color: teal });
      pdf.setDrawColor(...rule).setLineWidth(0.5).line(x, cursor + 4, x + columnWidth, cursor + 4);
      cursor += 14;
    }
    function paragraph(value, { size = bodySize, style = 'normal', mono = false, color = ink, indent = 0, after = 3, url } = {}) {
      for (const line of lines(value, columnWidth - indent, size, style, mono)) {
        ensure(size * 1.3);
        text(line, x + indent, cursor + size, size, { style, mono, color, url });
        cursor += size * 1.3;
      }
      cursor += after;
    }
    function measure(item) {
      const title = item.number ? `[${item.number}] ${item.title}` : item.title;
      return (item.date ? 13 : 0) + (title ? lines(title, columnWidth, 9.4, 'bold', true).length * 12.22 + 3 : 0)
        + (item.meta ? lines(item.meta, columnWidth, 8.3).length * 10.79 + 3 : 0)
        + item.paragraphs.reduce((total, value) => total + lines(value, columnWidth - (item.bullets ? 9 : 0), bodySize).length * lineHeight + 3, 0) + 9;
    }
    for (const section of sections) {
      ensure(48 + Math.min(measure(section.items[0]), bottom - 110), false);
      currentSection = section;
      heading(section);
      for (const [index, item] of section.items.entries()) {
        // Keep a normal entry together; allow a genuinely long entry to continue.
        ensure(Math.min(measure(item) + (index === section.items.length - 1 ? 14 : 0), bottom - 110));
        if (item.date) paragraph(item.date, { size: 7.7, mono: true, color: teal, after: 3 });
        if (item.title) paragraph(`${item.number ? `[${item.number}] ` : ''}${item.title}`, { size: 9.4, style: 'bold', mono: true, url: item.url });
        if (item.meta) paragraph(item.meta, { size: 8.3, color: muted });
        for (const value of item.paragraphs) {
          if (section.id === 'expertise') {
            pdf.setDrawColor(...teal).setLineWidth(0.7).rect(x, cursor + 4, 3, 3);
            paragraph(value, { indent: 10, after: 5 });
          } else {
            if (item.bullets) pdf.setFillColor(...teal).rect(x, cursor + 4, 2.5, 2.5, 'F');
            paragraph(value, { indent: item.bullets ? 9 : 0 });
          }
        }
        cursor += section.id === 'expertise' ? 0 : 7;
      }
      ensure(14);
      text('};', x, cursor + 5, 8, { mono: true, color: muted });
      cursor += 19;
    }
  }
  if (layout.primary.length) renderColumn(layout.primary, M, twoColumns ? mainWidth : width, false);
  if (layout.sidebar.length) renderColumn(layout.sidebar, twoColumns ? railX : M, twoColumns ? railWidth : width, twoColumns);

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page);
    pdf.setDrawColor(...rule).setLineWidth(0.6).line(M, H - 34, W - M, H - 34);
    pdf.setFillColor(...teal).rect(M, H - 36, 4, 4, 'F');
    text(page === pages ? '} // namespace miyuru' : model.name, M, H - 20, 7, { mono: true, color: muted });
    text(`${page} / ${pages}`, W - M, H - 20, 7, { mono: true, color: muted, align: 'right' });
  }
  return pdf;
}
