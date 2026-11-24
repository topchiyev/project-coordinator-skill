const topbar = document.querySelector('.topbar');
const changeNavigation = document.getElementById('change-navigation');
const overview = document.getElementById('overview');
const sections = document.getElementById('dashboard-sections');
const search = document.getElementById('document-search');
const searchResults = document.getElementById('search-results');
const searchStatus = document.getElementById('search-status');
const documents = Array.from(document.querySelectorAll('[data-document][data-path]'), view => ({
  id: view.id,
  title: view.getAttribute('aria-label'),
  path: view.dataset.path
}));
let activeDocument;

function updateScrollPadding() {
  document.documentElement.style.setProperty('--topbar-height', `${topbar.offsetHeight}px`);
}

function updateSearch() {
  const query = search.value.trim().toLocaleLowerCase();
  searchResults.replaceChildren();
  searchResults.hidden = !query;
  sections.hidden = Boolean(query);
  searchStatus.textContent = '';
  if (!query) return;

  const matches = documents.filter(entry =>
    entry.title.toLocaleLowerCase().includes(query) ||
    entry.path.toLocaleLowerCase().includes(query)
  );
  for (const entry of matches) {
    const item = document.createElement('li');
    item.className = 'document-link';
    const result = document.createElement('a');
    result.href = `#${encodeURIComponent(entry.id)}`;
    result.textContent = entry.title;
    const path = document.createElement('span');
    path.className = 'document-path';
    path.textContent = entry.path;
    item.append(result, path);
    searchResults.append(item);
  }

  searchStatus.textContent = matches.length
    ? `${matches.length} ${matches.length === 1 ? 'document' : 'documents'} found`
    : 'No documents found.';
}

function updateView() {
  let target;
  try {
    target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  } catch {
    target = null;
  }

  const nextDocument = target?.closest('[data-document]');
  if (activeDocument !== nextDocument) {
    if (activeDocument) activeDocument.hidden = true;
    activeDocument = nextDocument;
    const navigation = activeDocument?.querySelector('[data-change-navigation]');
    changeNavigation.replaceChildren(navigation?.content.cloneNode(true) ?? '');
    changeNavigation.hidden = !navigation;
  }
  overview.hidden = Boolean(activeDocument);
  if (activeDocument) activeDocument.hidden = false;
  if (target && sections.contains(target) && sections.hidden) {
    search.value = '';
    updateSearch();
  }
  updateScrollPadding();
  if (target) {
    target.focus({ preventScroll: true });
    target.scrollIntoView();
  }
}

search.addEventListener('input', updateSearch);
window.addEventListener('hashchange', updateView);
new ResizeObserver(updateScrollPadding).observe(topbar);
updateSearch();
updateView();
