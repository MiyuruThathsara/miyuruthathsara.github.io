(() => {
  const dialog = document.querySelector('#citation-dialog');
  if (!dialog) return;
  const papers = JSON.parse(document.querySelector('#cv-data').textContent).publications;
  const field = document.querySelector('#citation-bibtex');
  const copy = document.querySelector('#citation-copy');
  const status = document.querySelector('#citation-status');
  let opener;
  let request = 0;

  document.querySelectorAll('[data-cite]').forEach(link => link.addEventListener('click', async event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const paper = papers.find(paper => paper.id === link.dataset.cite);
    if (!paper) return;
    event.preventDefault();
    const current = ++request;
    opener = link;
    document.querySelector('#citation-reference').textContent = `${(paper.citation_authors || paper.authors).join(', ')}. “${paper.citation_title || paper.title}.” ${paper.conference}, pp. ${paper.pages}. DOI: ${paper.doi}.`;
    document.querySelector('#citation-download').href = link.href;
    field.value = '';
    copy.disabled = true;
    status.textContent = 'Loading citation…';
    dialog.showModal();
    try {
      const response = await fetch(link.href);
      if (!response.ok) throw new Error('Citation unavailable');
      const bibtex = await response.text();
      if (current !== request) return;
      field.value = bibtex;
      copy.disabled = false;
      status.textContent = '';
    } catch {
      if (current === request) status.textContent = 'Could not load the citation. Use Download .bib, or close and try again.';
    }
  }));
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(field.value);
      status.textContent = 'Citation copied.';
    } catch {
      field.focus();
      field.select();
      status.textContent = 'Copy is unavailable. The BibTeX is selected for manual copying.';
    }
  });
  dialog.querySelector('[data-close-citation]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { request++; opener?.focus(); });
})();
