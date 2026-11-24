import { parseArgs } from 'node:util';
import { renderDashboard } from './dashboard.mjs';
import { readProject, resolveProject, writeDashboard } from './project.mjs';

try {
  const { values } = parseArgs({
    options: {
      'project-root': { type: 'string', default: process.cwd() },
      output: { type: 'string', default: 'openspec/dashboard.html' },
      help: { type: 'boolean', short: 'h' }
    }
  });

  if (values.help) {
    console.log('Usage: node generate-dashboard.mjs [--project-root DIRECTORY] [--output RELATIVE_HTML_PATH]');
  } else {
    const project = resolveProject(values['project-root'], values.output);
    const html = renderDashboard(project, readProject(project));
    writeDashboard(project.output, html);
    console.log(project.output);
  }
} catch (error) {
  console.error(`Could not generate the OpenSpec Dashboard. ${error.message}`);
  process.exitCode = 1;
}
