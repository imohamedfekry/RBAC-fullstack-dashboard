import readline from 'node:readline';

const ansi = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  brightRed: '\x1b[91m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  bold: '\x1b[1m',
};

export type StrengthUi = {
  score: number;
  /** 0–10 */
  segments: number;
  label: string;
  color: string;
};

/** 0–100 score aligned with owner-seed password rules (length + character classes). */
export function scorePasswordStrength(password: string): number {
  let s = 0;
  const len = password.length;
  if (len >= 4) s += 4;
  if (len >= 8) s += 12;
  if (len >= 12) s += 18;
  if (len >= 16) s += 10;
  if (/[a-z]/.test(password)) s += 14;
  if (/[A-Z]/.test(password)) s += 14;
  if (/\d/.test(password)) s += 14;
  if (/[^a-zA-Z0-9\s]/.test(password)) s += 14;
  return Math.min(100, s);
}

export function strengthUi(password: string): StrengthUi {
  const score = scorePasswordStrength(password);
  const segments = Math.round((score / 100) * 10);
  let label: string;
  let color: string;
  if (password.length === 0) {
    label = 'empty';
    color = ansi.dim;
  } else if (score < 35) {
    label = 'weak';
    color = ansi.brightRed;
  } else if (score < 55) {
    label = 'fair';
    color = ansi.yellow;
  } else if (score < 75) {
    label = 'good';
    color = ansi.cyan;
  } else if (score < 90) {
    label = 'strong';
    color = ansi.green;
  } else {
    label = 'excellent';
    color = ansi.bold + ansi.green;
  }
  return { score, segments, label, color };
}

function bar(segments: number, width = 10): string {
  const filled = Math.max(0, Math.min(width, segments));
  const full = '█';
  const empty = '░';
  return `[${full.repeat(filled)}${empty.repeat(width - filled)}]`;
}

/**
 * Reads a password with live strength bar + label (masked). Uses a TTY when available.
 */
export function readPasswordWithStrengthMeter(prompt: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return readPasswordSimple(prompt);
  }

  return new Promise((resolve) => {
    const stdin = process.stdin;
    readline.emitKeypressEvents(stdin);
    const prevRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let buf = '';

    const redraw = () => {
      const ui = strengthUi(buf);
      const mask = '•'.repeat(buf.length);
      const b = bar(ui.segments);
      const line = `${ansi.bold}${prompt}${ansi.reset}${mask}  ${ui.color}${b} ${ui.label}${ansi.reset}`;
      process.stdout.write(`\r\x1b[2K${line}`);
    };

    redraw();

    const onData = (chunk: string | Buffer) => {
      const s = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      for (const ch of s) {
        if (ch === '\r' || ch === '\n') {
          cleanup();
          process.stdout.write('\n');
          resolve(buf);
          return;
        }
        if (ch === '\u0003') {
          cleanup();
          process.exit(0);
        }
        if (ch === '\u007f' || ch === '\b') {
          buf = buf.slice(0, -1);
          redraw();
          continue;
        }
        if (ch >= ' ' || ch.charCodeAt(0) > 127) {
          buf += ch;
          redraw();
        }
      }
    };

    const cleanup = () => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(prevRaw ?? false);
    };

    stdin.on('data', onData);
  });
}

/** Hidden password without meter (e.g. confirm). */
export function readPasswordSimple(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    if (!process.stdin.isTTY) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('', (ans) => {
        rl.close();
        resolve(ans.trim());
      });
      return;
    }

    const stdin = process.stdin;
    const prevRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let input = '';

    const onData = (chunk: string | Buffer) => {
      const s = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
      for (const ch of s) {
        if (ch === '\r' || ch === '\n') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(prevRaw ?? false);
          process.stdout.write('\n');
          resolve(input);
          return;
        }
        if (ch === '\u0003') process.exit(0);
        if (ch === '\u007f' || ch === '\b') {
          input = input.slice(0, -1);
          process.stdout.write('\b \b');
          continue;
        }
        if (ch >= ' ' || ch.charCodeAt(0) > 127) {
          input += ch;
          process.stdout.write('*');
        }
      }
    };
    stdin.on('data', onData);
  });
}
