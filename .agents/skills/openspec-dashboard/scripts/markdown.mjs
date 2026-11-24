import { posix } from 'node:path';
import GithubSlugger from 'github-slugger';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt({ html: false });
export const escapeHtml = markdown.utils.escapeHtml;
export const fragment = id => `#${encodeURIComponent(id)}`;
export const documentId = path => `document-${Buffer.from(path).toString('base64url')}`;

function inlineText(tokens) {
  return tokens.map(token => {
    if (token.type === 'softbreak' || token.type === 'hardbreak') return ' ';
    if (token.type === 'image') return inlineText(token.children ?? []);
    return ['text', 'code_inline'].includes(token.type) ? token.content : '';
  }).join('');
}

function styleSpecificationHeading(heading, inline) {
  const first = inline.children[0];
  if (first?.type !== 'text') return;
  const match = /^(Requirement|Scenario):(?=\s)/i.exec(first.content);
  if (!match) return;

  const kind = match[1].toLowerCase();
  const label = new heading.constructor('specification_label', '', 0);
  label.content = match[1];
  first.content = first.content.slice(match[0].length);
  inline.children.unshift(label, new heading.constructor('span_open', 'span', 1));
  inline.children.push(new heading.constructor('span_close', 'span', -1));
  heading.attrJoin('class', `specification-${kind}`);
  return kind;
}

function styleScenarioStep(item, inline) {
  const [open, word, close] = inline.children.filter(child => child.type !== 'text' || child.content);
  if (open?.type !== 'strong_open' || word?.type !== 'text' || close?.type !== 'strong_close') return;
  if (!/^(GIVEN|WHEN|THEN|AND|BUT)$/i.test(word.content)) return;

  open.attrJoin('class', `scenario-keyword scenario-keyword-${word.content.toLowerCase()}`);
  item.attrJoin('class', 'scenario-step');
}

export function parseDocument(document) {
  const environment = {};
  const tokens = markdown.parse(document.markdown, environment);
  const id = documentId(document.path);
  const headings = new Map();
  const slugger = new GithubSlugger();
  let title;
  let completedTasks = 0;
  let totalTasks = 0;
  let scenarioLevel = 0;

  for (const [index, token] of tokens.entries()) {
    if (token.type === 'heading_open') {
      const inline = tokens[index + 1];
      const headingText = inlineText(inline.children).trim();
      const slug = slugger.slug(headingText);
      const headingId = `${id}--${slug}`;
      headings.set(slug, headingId);
      token.attrSet('id', headingId);
      token.attrSet('tabindex', '-1');
      title ??= headingText || undefined;

      const kind = styleSpecificationHeading(token, inline);
      const level = Number(token.tag.slice(1));
      if (token.level === 0) {
        if (kind === 'scenario') scenarioLevel = level;
        else if (level <= scenarioLevel) scenarioLevel = 0;
      }
    }

    if (token.type !== 'list_item_open' || tokens[index + 1]?.type !== 'paragraph_open') continue;
    const inline = tokens[index + 2];
    if (inline?.type !== 'inline') continue;
    if (scenarioLevel) styleScenarioStep(token, inline);

    const taskPattern = document.name.toLowerCase() === 'tasks.md'
      ? /^\[([^\]\n]*)\](?:[ \t]+|$)/
      : /^\[([ xX])\](?:[ \t]+|$)/;
    const marker = inline.content.match(taskPattern);
    if (!marker) continue;

    const checked = /^x$/i.test(marker[1].trim());
    totalTasks += 1;
    completedTasks += Number(checked);
    token.attrJoin('class', 'task-item');
    const label = checked ? 'Completed task' : 'Open task';
    const state = checked ? ' task-marker-checked' : '';
    inline.content = inline.content.slice(marker[0].length);
    inline.children = [];
    markdown.inline.parse(inline.content, markdown, environment, inline.children);
    const status = new token.constructor('task_marker', '', 0);
    status.content = `<span class="task-marker${state}" role="img" aria-label="${label}"></span>`;
    inline.children.unshift(status);
  }

  return {
    ...document,
    id,
    title: title ?? document.name,
    headings,
    tokens,
    environment,
    completedTasks,
    totalTasks
  };
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

function resolveLink(href, document, documents, groups, outputPath) {
  if (/^(https?:|mailto:)/i.test(href)) return href;
  if (/^(?:[a-z][a-z\d+.-]*:|[/\\]{2})/i.test(href)) return null;

  const match = /^([^?#]*)(\?[^#]*)?(?:#(.*))?$/.exec(href);
  if (!match) return null;
  const [, encodedPath, query = '', encodedHeading = ''] = match;
  const path = decode(encodedPath);
  const heading = decode(encodedHeading);
  if (path === null || heading === null || /[\\\u0000-\u001f]/.test(path)) return null;

  const targetPath = path
    ? posix.normalize(path.startsWith('/') ? path.slice(1) : posix.join(posix.dirname(document.path), path))
    : document.path;
  if (targetPath === '..' || targetPath.startsWith('../')) return null;

  const targetDocument = documents.get(targetPath);
  if (targetDocument) {
    return fragment(targetDocument.headings.get(heading) ?? targetDocument.id);
  }

  const directory = targetPath.replace(/\/$/, '');
  const group = groups.get(directory);
  if (group) return fragment(group);

  const relativePath = posix.relative(posix.dirname(outputPath), targetPath);
  const encodedRelativePath = relativePath.split('/').map(encodeURIComponent).join('/');
  return `./${encodedRelativePath}${query}${encodedHeading ? `#${encodedHeading}` : ''}`;
}

markdown.renderer.rules.task_marker = (tokens, index) => tokens[index].content;
markdown.renderer.rules.specification_label = (tokens, index) =>
  `<span class="specification-label">${escapeHtml(tokens[index].content)}</span>`;
markdown.renderer.rules.table_open = () => '<div class="table-scroll"><table>\n';
markdown.renderer.rules.table_close = () => '</table></div>\n';
markdown.renderer.rules.image = (tokens, index) => {
  const token = tokens[index];
  const label = escapeHtml(inlineText(token.children ?? []) || 'Image source');
  const href = token.attrGet('src');
  return href && !token.meta?.linked ? `<a href="${escapeHtml(href)}" class="image-link">${label}</a>` : label;
};

markdown.renderer.rules.link_open = (tokens, index, options, environment, renderer) => {
  return tokens[index].attrGet('href') ? renderer.renderToken(tokens, index, options) : '<span>';
};
markdown.renderer.rules.link_close = (tokens, index) => tokens[index].meta?.blocked ? '</span>' : '</a>';

export function renderDocument(document, documents, groups, outputPath) {
  for (const token of document.tokens) {
    let linked = false;
    let blockedLink = false;
    for (const child of token.children ?? []) {
      if (child.type === 'link_open') {
        const href = resolveLink(child.attrGet('href'), document, documents, groups, outputPath);
        child.attrSet('href', href ?? '');
        linked = true;
        blockedLink = !href;
      } else if (child.type === 'link_close') {
        child.meta = { blocked: blockedLink };
        linked = false;
      } else if (child.type === 'image') {
        const href = resolveLink(child.attrGet('src'), document, documents, groups, outputPath);
        child.attrSet('src', href ?? '');
        child.meta = { linked };
      }
    }
  }

  return markdown.renderer.render(document.tokens, markdown.options, document.environment);
}
