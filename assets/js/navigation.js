// Keep links to the former one-page sections useful after the page split.
const navigation = document.querySelector('.site-header nav');
const home = new URL(navigation.querySelector('[data-section="about"]').href);
if (location.pathname === home.pathname && location.hash) {
  const section = location.hash.slice(1);
  const link = [...document.querySelectorAll('nav [data-section]')].find(link => link.dataset.section === section);
  if (link && new URL(link.href).pathname !== home.pathname) location.replace(link.href);
  else if (section === 'profile') location.replace(new URL('#about', home).href);
  else if (section === 'publications') location.replace(new URL('research/#publications', home).href);
  else if (section === 'review') location.replace(new URL('experience/#review', home).href);
  else if (section === 'awards') location.replace(new URL('education/#awards', home).href);
}

// Keep the current tab visible in the single-row strip without scrolling the page.
function revealTab(current) {
  if (!current) return;
  const tab = current.getBoundingClientRect();
  const strip = navigation.getBoundingClientRect();
  if (tab.left < strip.left) navigation.scrollLeft += tab.left - strip.left - 6;
  else if (tab.right > strip.right) navigation.scrollLeft += tab.right - strip.right + 6;
}
function revealCurrentTab() {
  revealTab(navigation.contains(document.activeElement) ? document.activeElement.closest('a') : navigation.querySelector('[aria-current="page"]'));
}
revealCurrentTab();
window.addEventListener('resize', revealCurrentTab);
navigation.addEventListener('focusin', event => revealTab(event.target.closest('a')));
