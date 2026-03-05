import { select, isCancel } from '@clack/prompts'
import pc from 'picocolors'
import { validateEnv } from '../utils/env.js'
import { commandExists, execStreaming } from '../utils/exec.js'

export async function runDev() {
  const { ok, missing } = validateEnv()
  if (!ok) {
    console.log(
      pc.red(`\n  Missing env vars: ${missing.join(', ')}\n  Run ${pc.bold('pnpm uru setup')} first.\n`),
    )
    process.exit(1)
  }

  const mode = await select({
    message: 'Development mode',
    options: [
      { value: 'web', label: 'Web only', hint: 'vite on :3000' },
      { value: 'desktop', label: 'Desktop', hint: 'Tauri + vite' },
      { value: 'back', label: pc.dim('← Back') },
    ],
  })

  if (isCancel(mode)) process.exit(0)
  if (mode === 'back') return 'back' as const

  if (mode === 'desktop' && !commandExists('cargo')) {
    console.log(pc.red('\n  Rust toolchain not found. Install from https://rustup.rs\n'))
    process.exit(1)
  }

  console.log()
  if (mode === 'web') {
    execStreaming('pnpm', ['vite', 'dev', '--port', '3000'])
  } else {
    execStreaming('pnpm', ['tauri', 'dev'])
  }
}
