import { execFileSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { platform } from 'node:os'
import { join } from 'node:path'

const isWin = platform() === 'win32'

const editorDefs = [
  {
    key: 'vscode',
    name: 'VS Code',
    cmd: isWin ? 'code.cmd' : 'code',
    args: (f: string, l: number | string, c: number | string) => ['-g', `${f}:${l}:${c}`],
    fallback: [
      join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'bin', 'code.cmd'),
      join(process.env.PROGRAMFILES || '', 'Microsoft VS Code', 'bin', 'code.cmd'),
      '/usr/local/bin/code',
      '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
    ],
  },
  {
    key: 'cursor',
    name: 'Cursor',
    cmd: isWin ? 'cursor.cmd' : 'cursor',
    args: (f: string, l: number | string, c: number | string) => ['-g', `${f}:${l}:${c}`],
    fallback: [
      join(process.env.LOCALAPPDATA || '', 'Programs', 'Cursor', 'bin', 'cursor.cmd'),
      '/usr/local/bin/cursor',
      '/Applications/Cursor.app/Contents/Resources/app/bin/cursor',
    ],
  },
  {
    key: 'webstorm',
    name: 'WebStorm',
    cmd: isWin ? 'webstorm.cmd' : 'webstorm',
    args: (f: string, l: number | string) => ['--line', l, f],
    fallback: [
      join(
        process.env.LOCALAPPDATA || '',
        'JetBrains',
        'Toolbox',
        'apps',
        'WebStorm',
        'ch-0',
        '*',
        'bin',
        'webstorm.cmd',
      ),
      '/Applications/WebStorm.app/Contents/MacOS/webstorm',
    ],
  },
  {
    key: 'sublime',
    name: 'Sublime Text',
    cmd: isWin ? 'subl.exe' : 'subl',
    args: (f: string, l: number | string, c: number | string) => [`${f}:${l}:${c}`],
    fallback: [],
  },
  {
    key: 'atom',
    name: 'Atom',
    cmd: isWin ? 'atom.cmd' : 'atom',
    args: (f: string, l: number | string, c: number | string) => [`${f}:${l}:${c}`],
    fallback: [],
  },
  {
    key: 'nvim',
    name: 'Neovim',
    cmd: 'nvim',
    args: (f: string, l: number | string) => [`+${l}`, f],
    fallback: [],
  },
]

function exists(cmd: string) {
  try {
    execFileSync(cmd, ['--version'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function isProcessRunning(processName: string): boolean {
  try {
    if (isWin) {
      // Windows: use tasklist command
      const result = execFileSync('tasklist', [], {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'ignore'],
      })
      return result.toLowerCase().includes(processName.toLowerCase())
    }
    // macOS/Linux: use ps command
    const result = execFileSync('ps', ['aux'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
    return result.toLowerCase().includes(processName.toLowerCase())
  } catch {
    return false
  }
}

function getRunningEditor(defs = editorDefs) {
  for (const ed of defs) {
    // check if the editor process is running
    const processName = ed.name.replace(/\s+/g, '').toLowerCase()
    if (isProcessRunning(processName) || isProcessRunning(ed.key)) {
      // check if the editor command is available
      if (exists(ed.cmd)) return ed
      for (const p of ed.fallback) {
        if (existsSync(p)) {
          ed.cmd = p
          return ed
        }
      }
    }
  }
  return null
}

function findFirstAvailable(defs = editorDefs) {
  for (const ed of defs) {
    if (exists(ed.cmd)) return ed
    for (const p of ed.fallback) {
      if (existsSync(p)) {
        ed.cmd = p
        return ed
      }
    }
  }
  return null
}

export default function launchEditor(file: string, line = 1, column = 1, editorKey?: string) {
  const subset = editorKey ? editorDefs.filter((e) => e.key === editorKey) : editorDefs

  // use the running editor first
  let ed = getRunningEditor(subset)

  // if running editor not found, find the first available one
  if (!ed) {
    ed = findFirstAvailable(subset)
  }

  if (!ed) throw new Error('Cannot find a code editor installed on the system.')
  const args = ed.args(file, line, column).map((a) => String(a))
  spawn(ed.cmd, args, { stdio: 'inherit' })
  return ed.name
}
