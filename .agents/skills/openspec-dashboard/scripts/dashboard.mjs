import { readFileSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { isAlias, parseDocument as parseYamlDocument } from 'yaml';
import { documentId, escapeHtml, fragment, parseDocument, renderDocument } from './markdown.mjs';
import { outputMarker } from './project.mjs';

function asset(name) {
  return readFileSync(new URL(`../assets/${name}`, import.meta.url), 'utf8');
}

function linkItem({ id, title }, anchor, detail = '') {
  const attributes = anchor ? ` id="${anchor}" tabindex="-1"` : '';
  return `<li class="document-link"${attributes}><a href="${fragment(id)}">${escapeHtml(title)}</a>${detail}</li>`;
}

function overviewList(items) {
  return items.length ? `<ul class="document-list overview-link">${items.join('\n')}</ul>` : '';
}

function groupId(path) {
  return `group-${Buffer.from(path).toString('base64url')}`;
}

function taskProgress(tasks, label = 'Tasks complete') {
  if (!tasks?.totalTasks) return '<div class="progress">No tasks listed</div>';
  const { totalTasks, completedTasks } = tasks;
  return `<div class="progress">
    <span>${completedTasks} / ${totalTasks} tasks complete</span>
    <progress max="${totalTasks}" value="${completedTasks}" aria-label="${escapeHtml(label)}"></progress>
  </div>`;
}

function creationDate(metadata) {
  if (!metadata) return;
  const document = parseYamlDocument(metadata, { schema: 'core' });
  if (document.errors.length) return;
  const node = document.get('created', true);
  const created = (isAlias(node) ? node.resolve(document) : node)?.value;
  if (typeof created !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(created)) return;

  const date = new Date(created);
  if (Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === created) return created;
}

function compareActiveChanges(first, second) {
  const firstStarted = Number((first.tasks?.completedTasks ?? 0) > 0);
  const secondStarted = Number((second.tasks?.completedTasks ?? 0) > 0);
  return secondStarted - firstStarted
    || (second.lastActivity ?? -Infinity) - (first.lastActivity ?? -Infinity)
    || first.name.localeCompare(second.name, 'en');
}

function section(id, title, content, emptyText) {
  return `<section class="dashboard-section" id="${id}" aria-labelledby="${id}-title" tabindex="-1">
    <h2 id="${id}-title">${title}</h2>
    ${content || `<p class="empty section-empty">${emptyText}</p>`}
  </section>`;
}

function statistic(value, label) {
  return `<div class="statistic"><dt>${label}</dt><dd>${value}</dd></div>`;
}

function changeNavigation(change, pageId, sectionId = pageId) {
  const links = change.links.map(link => {
    const current = link.id === sectionId ? ` aria-current="${link.id === pageId ? 'page' : 'location'}"` : '';
    return `<li><a href="${fragment(link.id)}"${current}>${link.title}</a></li>`;
  });
  return `<template data-change-navigation>
      <nav aria-label="Change documents">
        <ul class="document-list">${links.join('\n')}</ul>
      </nav>
    </template>`;
}

function pageMarkup({ id, title, path, navigation = '', progress = '', content }) {
  const escapedPath = path && escapeHtml(path);
  return `
    <article class="document-view" id="${id}" data-document${escapedPath ? ` data-path="${escapedPath}"` : ''}
      hidden tabindex="-1" aria-label="${escapeHtml(title)}">
      ${navigation}
      ${escapedPath ? `<header class="document-header">
        <p class="document-location">${escapedPath}</p>
        ${progress}
      </header>` : ''}
      <div class="markdown">${content}</div>
    </article>`;
}

function changeLandingPages(change) {
  const pages = [];
  if (!change.proposal) {
    pages.push(pageMarkup({
      id: change.proposalId,
      title: 'Proposal',
      navigation: changeNavigation(change, change.proposalId),
      content: '<h1>Proposal</h1><p>No proposal is available for this change.</p>'
    }));
  }
  if (change.deltaId) {
    pages.push(pageMarkup({
      id: change.deltaId,
      title: 'Delta specs',
      navigation: changeNavigation(change, change.deltaId),
      content: `<h1>Delta specs</h1><ul class="delta-spec-list">${change.deltaSpecs.map(spec => linkItem(spec)).join('\n')}</ul>`
    }));
  }
  return pages;
}

export function renderDashboard(project, source) {
  const documents = new Map();
  const groups = new Map();
  const changeByDocument = new Map();

  function addDocument(rawDocument) {
    const document = parseDocument(rawDocument);
    documents.set(document.path, document);
    return document;
  }

  function addChange(group) {
    const id = groupId(group.path);
    const changeDocuments = group.documents.map(addDocument);
    const proposalPath = `${group.path}/proposal.md`;
    const proposal = documents.get(proposalPath);
    const proposalId = documentId(proposalPath);
    const design = documents.get(`${group.path}/design.md`);
    const tasks = documents.get(`${group.path}/tasks.md`);
    const deltaPath = `${group.path}/specs`;
    const deltaSpecs = changeDocuments.filter(document => document.path.startsWith(`${deltaPath}/`));
    const deltaId = deltaSpecs.length ? `delta-specs-${id}` : '';
    const links = [
      { title: 'Proposal', id: proposalId },
      { title: 'Delta specs', id: deltaId },
      { title: 'Design', id: design?.id },
      { title: 'Tasks', id: tasks?.id }
    ].filter(link => link.id);
    const created = creationDate(group.metadata);
    const lastActivity = group.lastModified ?? (created ? Date.parse(created) : undefined);
    const change = { id, name: group.name, proposal, proposalId, tasks, deltaId, deltaSpecs, links, created, lastActivity };
    groups.set(group.path, id);
    if (deltaId) groups.set(deltaPath, deltaId);
    for (const document of changeDocuments) changeByDocument.set(document, change);
    return change;
  }

  const overview = source.overview && addDocument(source.overview);
  const specificationLinks = source.topLevelSpecifications.map(document => linkItem(addDocument(document)));
  for (const group of source.specificationGroups) {
    if (!group.documents.length) continue;
    const id = groupId(group.path);
    groups.set(group.path, id);
    for (const [index, document] of group.documents.entries()) {
      specificationLinks.push(linkItem(addDocument(document), index === 0 ? id : undefined));
    }
  }
  const changes = source.changes.map(addChange).sort(compareActiveChanges);
  const archives = source.archives.map(addChange);
  const outputPath = relative(project.root, project.output).split(sep).join('/');
  const projectName = escapeHtml(project.name);

  const taskDocuments = changes.map(change => change.tasks).filter(Boolean);
  const completedTasks = taskDocuments.reduce((total, document) => total + document.completedTasks, 0);
  const totalTasks = taskDocuments.reduce((total, document) => total + document.totalTasks, 0);
  const changeLink = (change, detail) => linkItem({ id: change.proposalId, title: change.name }, change.id, detail);
  const activeChangeLinks = changes.map(change => {
    const created = change.created
      ? `<span class="change-created">Created <time datetime="${change.created}">${change.created}</time></span>`
      : '';
    return changeLink(change, taskProgress(change.tasks, `Tasks complete for ${change.name}`) + created);
  });
  const documentViews = Array.from(documents.values(), document => {
    const change = changeByDocument.get(document);
    const sectionId = change?.deltaSpecs.includes(document) ? change.deltaId : document.id;
    const heading = document.headings.size ? '' : `<h1>${escapeHtml(document.title)}</h1>`;
    return pageMarkup({
      ...document,
      navigation: change ? changeNavigation(change, document.id, sectionId) : '',
      progress: change?.tasks === document ? taskProgress(document) : '',
      content: heading + renderDocument(document, documents, groups, outputPath)
    });
  });
  const landingPages = [...changes, ...archives].flatMap(changeLandingPages);

  return `${outputMarker}
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
  <title>${projectName} · OpenSpec Dashboard</title>
  <script>${asset('theme.js')}</script>
  <style>${asset('dashboard.css')}</style>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="topbar">
    <div class="frame topbar-inner">
      <a class="brand" href="#overview">OpenSpec Dashboard</a>
      <nav aria-label="Dashboard sections">
        <a href="#active-changes">Changes</a>
        <a href="#specifications">Specs</a>
        <a href="#archive">Archive</a>
      </nav>
      <fieldset class="theme-switch" id="theme-switch">
        <legend>Color theme</legend>
        <label><input type="radio" name="theme" value="auto" checked><span>Auto</span></label>
        <label><input type="radio" name="theme" value="light"><span>Light</span></label>
        <label><input type="radio" name="theme" value="dark"><span>Dark</span></label>
      </fieldset>
    </div>
    <div id="change-navigation" class="frame change-navigation" hidden></div>
  </header>
  <main class="frame" id="main" tabindex="-1">
    <div id="overview" tabindex="-1">
      <header class="hero">
        <h1>${projectName}</h1>
        <dl class="statistics">
          ${statistic(changes.length, 'Active changes')}
          ${statistic(`${completedTasks} / ${totalTasks}`, 'Active tasks complete')}
          ${statistic(specificationLinks.length, 'Specification documents')}
          ${statistic(archives.length, 'Archived changes')}
        </dl>
      </header>
      <section class="document-search" aria-label="Find documents">
        <label for="document-search">Find a document</label>
        <input id="document-search" type="search" placeholder="Search by title or path" autocomplete="off">
        <p class="search-status" id="search-status" role="status" aria-atomic="true"></p>
        <ul class="document-list search-results" id="search-results" hidden></ul>
      </section>
      <div id="dashboard-sections">
        ${overview ? overviewList([linkItem(overview)]) : ''}
        ${section('active-changes', 'Active changes',
          overviewList(activeChangeLinks), 'No active changes.')}
        ${section('specifications', 'Specifications',
          overviewList(specificationLinks), 'No specification documents.')}
        ${section('archive', 'Archived changes',
          overviewList(archives.map(change => changeLink(change))), 'No archived changes.')}
      </div>
    </div>
    ${[...documentViews, ...landingPages].join('\n')}
  </main>
  <script>${asset('dashboard.js')}</script>
</body>
</html>
`;
}
