// Keep links to the former one-page sections useful after the page split.
const home = new URL(document.querySelector('.site-brand').href);
if (location.pathname === home.pathname && location.hash) {
  const section = location.hash.slice(1);
  const link = [...document.querySelectorAll('nav [data-section]')].find(link => link.dataset.section === section);
  if (link && new URL(link.href).pathname !== home.pathname) location.replace(link.href);
  else if (section === 'profile') location.replace(new URL('#about', home).href);
  else if (section === 'publications') location.replace(new URL('research/#publications', home).href);
  else if (section === 'review') location.replace(new URL('experience/#review', home).href);
  else if (section === 'awards') location.replace(new URL('education/#awards', home).href);
}
