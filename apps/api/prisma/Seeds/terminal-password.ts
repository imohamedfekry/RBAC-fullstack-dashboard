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

function hasSequentialRun(s: string, minLen: number): boolean {
  for (let i = 0; i <= s.length - minLen; i++) {
    let asc = true;
    let desc = true;
    for (let j = 1; j < minLen; j++) {
      const d = s.charCodeAt(i + j) - s.charCodeAt(i + j - 1);
      if (d !== 1) asc = false;
      if (d !== -1) desc = false;
    }
    if (asc || desc) return true;
  }
  return false;
}

/** e.g. `abab`, `abcabc` — whole string built from repeating a short chunk */
function hasTrivialRepeatPattern(s: string): boolean {
  const half = Math.floor(s.length / 2);
  for (let chunkLen = 2; chunkLen <= half; chunkLen++) {
    if (s.length % chunkLen !== 0) continue;
    const chunk = s.slice(0, chunkLen);
    if (chunk.repeat(s.length / chunkLen) === s) return true;
  }
  return false;
}

/**
 * 0–100 strength estimate: charset size × length (entropy-ish), variety, class mix,
 * minus simple pattern penalties. Length alone does not carry the score.
 */
export function scorePasswordStrength(password: string): number {
  if (password.length === 0) return 0;

  const len = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9\s]/.test(password);
  const classCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  let pool = 0;
  if (hasLower) pool += 26;
  if (hasUpper) pool += 26;
  if (hasDigit) pool += 10;
  if (hasSymbol) pool += 30;

  // --- Bits if characters were random in the used alphabet (capped contribution) ---
  const bits = len * Math.log2(Math.max(pool, 2));
  let score = Math.min(38, (bits / 52) * 38);

  // --- How many character classes (max 24) ---
  score += classCount === 1 ? 6 : classCount === 2 ? 12 : classCount === 3 ? 18 : 24;

  // --- Internal variety: unique / length (max 22) ---
  const uniq = new Set(password).size;
  const varietyRatio = uniq / len;
  score += varietyRatio * 22;

  // --- Obvious junk ---
  let penalty = 0;
  if (/^(.)\1+$/.test(password)) penalty += 50;
  else if (uniq === 1) penalty += 45;
  if (hasSequentialRun(password, 4)) penalty += 14;
  if (hasTrivialRepeatPattern(password)) penalty += 16;

  score -= penalty;

  // --- Short passwords cannot score "strong" even if complex (mild, not harsh) ---
  const targetLen = 12;
  if (len < targetLen) {
    score *= 0.35 + 0.65 * (len / targetLen);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
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
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
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
