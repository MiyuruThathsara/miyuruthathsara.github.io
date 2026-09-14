(() => {
  const dialog = document.querySelector('#image-dialog');
  const picture = document.querySelector('#image-full');
  const viewport = dialog.querySelector('.image-viewport');
  const zoomIn = document.querySelector('#image-zoom-in');
  const zoomOut = document.querySelector('#image-zoom-out');
  let scale = 1;
  let fitWidth = 1;
  let opener;

  function resize() {
    picture.style.width = `${fitWidth * scale}px`;
    document.querySelector('#image-scale').value = `${Math.round(scale * 100)}%`;
    zoomOut.disabled = scale <= 1;
    zoomIn.disabled = scale >= 4;
  }

  function fit() {
    if (!picture.naturalWidth) return;
    fitWidth = Math.min(picture.naturalWidth, viewport.clientWidth, viewport.clientHeight * picture.naturalWidth / picture.naturalHeight);
    scale = 1;
    resize();
    viewport.scrollTo(0, 0);
  }

  document.querySelectorAll('[data-image-viewer]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      const source = link.querySelector('img');
      document.querySelector('#image-title').textContent = link.dataset.imageTitle;
      document.querySelector('#image-original').href = link.href;
      const vector = document.querySelector('#image-vector');
      vector.hidden = !link.dataset.vectorUrl;
      if (link.dataset.vectorUrl) vector.href = link.dataset.vectorUrl;
      picture.alt = source.alt;
      picture.style.width = '100%';
      picture.src = source.currentSrc || source.src;
      dialog.showModal();
      picture.decode().then(fit).catch(() => {
        // The original link remains available if the preview cannot load.
        picture.alt = 'Preview unavailable. Use Open original to view this image.';
      });
    });
  });
  zoomIn.addEventListener('click', () => { scale = Math.min(4, scale + 0.5); resize(); });
  zoomOut.addEventListener('click', () => { scale = Math.max(1, scale - 0.5); resize(); });
  document.querySelector('#image-fit').addEventListener('click', fit);
  dialog.querySelector('[data-close-image]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
  window.addEventListener('resize', () => { if (dialog.open) fit(); });
})();
