import { fork } from 'node:child_process';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { createServer, request } from 'node:http';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { isGeneratedDashboard, readProject, resolveProject, writeDashboard } from './project.mjs';

const host = '127.0.0.1';
const defaultOutput = 'openspec/dashboard.html';

function controlAddress(root) {
  const key = createHash('sha256').update(JSON.stringify([homedir(), root])).digest('hex').slice(0, 24);
  if (process.platform === 'win32') return `\\\\.\\pipe\\openspec-dashboard-${key}`;

  const directory = join(tmpdir(), `openspec-${process.getuid()}`);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stat = lstatSync(directory);
  if (!stat.isDirectory() || stat.uid !== process.getuid() || (stat.mode & 0o077)) {
    throw new Error(`Expected a private dashboard runtime directory at ${directory}`);
  }
  return join(directory, `${key}.sock`);
}

function control(socketPath, method = 'GET') {
  return new Promise((resolve, reject) => {
    const call = request({ socketPath, method, agent: false }, async response => {
      try {
        let body = '';
        for await (const chunk of response) body += chunk;
        const result = JSON.parse(body);
        if (result.error) throw new Error(result.error);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    call.setTimeout(30_000, () => call.destroy(new Error('The dashboard server did not respond.')));
    call.on('error', error => {
      if (['ENOENT', 'ECONNREFUSED'].includes(error.code)) resolve(null);
      else reject(error);
    });
    call.end();
  });
}

function listen(server, options) {
  const listening = once(server, 'listening');
  server.listen(options);
  return listening;
}

async function runServer(root, output, port, socketPath) {
  let file;
  const dashboard = createServer((req, res) => {
    if (req.url !== '/') {
      res.writeHead(404).end();
      return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    try {
      if (realpathSync(file) !== file) throw new Error('Unexpected dashboard path.');
      const html = readFileSync(file);
      if (!isGeneratedDashboard(html)) {
        throw new Error('Expected generated dashboard HTML.');
      }
      res.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': html.length
      }).end(req.method === 'HEAD' ? undefined : html);
    } catch {
      res.writeHead(503).end('Dashboard unavailable. Regenerate it and reload.');
    }
  });

  const commands = createServer(async (req, res) => {
    try {
      const status = await ready;
      if (req.method === 'POST') {
        dashboard.close();
        dashboard.closeAllConnections();
        commands.close();
      }
      res.end(JSON.stringify(status));
    } catch (error) {
      res.end(JSON.stringify({ error: error.message }));
    }
  });

  const ready = (async () => {
    await listen(commands, { path: socketPath });
    const project = resolveProject(root, output);
    if (!existsSync(project.output)) {
      const { renderDashboard } = await import('./dashboard.mjs');
      writeDashboard(project.output, renderDashboard(project, readProject(project)));
    }
    file = realpathSync(project.output);
    await listen(dashboard, { host, port });
    return { url: `http://${host}:${dashboard.address().port}/` };
  })();

  try {
    process.send({ status: await ready });
  } catch (error) {
    commands.close();
    dashboard.close();
    process.send({ error: error.message, code: error.code });
  }
}

async function start(root, output, port, socketPath) {
  const previousSocket = process.platform === 'win32'
    ? undefined : lstatSync(socketPath, { throwIfNoEntry: false });
  const running = await control(socketPath);
  if (running) return running;

  // A process killed before closing its sockets can leave a socket file behind.
  if (previousSocket?.isSocket()) {
    const current = lstatSync(socketPath, { throwIfNoEntry: false });
    if (current?.ino === previousSocket.ino && current.dev === previousSocket.dev) {
      rmSync(socketPath, { force: true });
    }
  }

  const child = fork(fileURLToPath(import.meta.url), ['_serve', root, output, String(port), socketPath], {
    detached: true,
    execArgv: [],
    stdio: ['ignore', 'ignore', 'ignore', 'ipc']
  });
  const result = await new Promise((resolve, reject) => {
    child.once('message', resolve);
    child.once('error', reject);
    child.once('exit', () => reject(new Error('The dashboard server exited before reporting its address.')));
  });
  if (child.connected) child.disconnect();
  child.unref();

  if (result.status) return result.status;
  // Another invocation may have acquired the control socket while this child started.
  if (result.code === 'EADDRINUSE') {
    const concurrent = await control(socketPath);
    if (concurrent) return concurrent;
  }
  throw new Error(result.error);
}

const usage = 'Usage: node serve-dashboard.mjs <serve|status|stop> [--project-root DIRECTORY] [--output RELATIVE_HTML_PATH] [--port PORT]';

try {
  if (process.argv[2] === '_serve' && process.send) {
    const [root, output, port, socketPath] = process.argv.slice(3);
    await runServer(root, output, Number(port), socketPath);
  } else {
    const { values, positionals } = parseArgs({
      allowPositionals: true,
      options: {
        'project-root': { type: 'string', default: process.cwd() },
        output: { type: 'string', default: defaultOutput },
        port: { type: 'string', default: '0' },
        help: { type: 'boolean', short: 'h' }
      }
    });
    const [action] = positionals;
    if (values.help) {
      console.log(usage);
    } else {
      if (positionals.length !== 1 || !['serve', 'status', 'stop'].includes(action)) throw new Error(usage);
      const root = realpathSync(values['project-root']);
      const socketPath = controlAddress(root);
      if (action === 'serve') {
        if (!/^\d+$/.test(values.port) || Number(values.port) > 65535) {
          throw new Error('Expected --port to be an integer from 0 to 65535.');
        }
        console.log((await start(root, values.output, Number(values.port), socketPath)).url);
      } else {
        const stopping = action === 'stop';
        const running = await control(socketPath, stopping ? 'POST' : 'GET');
        if (!running) console.log('Dashboard server is not running.');
        else console.log(stopping ? 'Dashboard server stopped.' : running.url);
      }
    }
  }
} catch (error) {
  console.error(`Could not manage the OpenSpec Dashboard server. ${error.message}`);
  process.exitCode = 1;
}
