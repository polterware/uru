import { select, text, isCancel } from '@clack/prompts'
import pc from 'picocolors'
import { existsSync, readFileSync } from 'node:fs'
import { commandExists, execInteractive } from '../utils/exec.js'

const LINK_REF_FILE = 'supabase/.temp/project-ref'

function isLinked(): boolean {
  if (!existsSync(LINK_REF_FILE)) return false
  const ref = readFileSync(LINK_REF_FILE, 'utf-8').trim()
  return ref.length > 0
}

function getLinkedRef(): string {
  return readFileSync(LINK_REF_FILE, 'utf-8').trim()
}

function dbPasswordArgs(): string[] {
  const pw = process.env.SUPABASE_DB_PASSWORD
  return pw ? ['--password', pw] : []
}

async function ensureLinked(forceRelink: boolean) {
  if (!commandExists('supabase')) {
    console.log(pc.red('  Supabase CLI not found. Install: brew install supabase/tap/supabase'))
    process.exit(1)
  }

  if (forceRelink || !isLinked()) {
    const reason = forceRelink ? '(relink forced)' : '(no linked project found)'
    console.log(pc.yellow(`  Linking project ${reason}`))
    const code = await execInteractive('supabase', ['link', ...dbPasswordArgs()])
    if (code !== 0) {
      console.log(pc.red('  supabase link failed'))
      process.exit(1)
    }
  } else {
    console.log(pc.dim(`  Linked project: ${getLinkedRef()}`))
  }
}

async function linkedPush(forceRelink: boolean) {
  await ensureLinked(forceRelink)
  console.log()
  const code = await execInteractive('supabase', ['db', 'push', '--linked', ...dbPasswordArgs()])
  if (code !== 0) process.exit(1)
  console.log(pc.green('\n  Migrations pushed successfully'))
}

async function linkedLint(forceRelink: boolean) {
  await ensureLinked(forceRelink)
  console.log()
  const code = await execInteractive('supabase', ['db', 'lint', '--linked'])
  if (code !== 0) process.exit(1)
}

async function linkedReset(forceRelink: boolean) {
  await ensureLinked(forceRelink)

  console.log()
  console.log(
    pc.yellow(
      '  WARNING: This will DROP all user-created entities in the\n  LINKED remote database and reapply migrations.',
    ),
  )
  console.log()

  const confirmation = await text({
    message: `Type ${pc.bold('RESET')} to continue`,
    validate: (v) => (v !== 'RESET' ? 'Type RESET to confirm' : undefined),
  })

  if (isCancel(confirmation)) process.exit(0)

  console.log()
  const code = await execInteractive('supabase', [
    'db',
    'reset',
    '--linked',
    ...dbPasswordArgs(),
  ])
  if (code !== 0) process.exit(1)
  console.log(pc.green('\n  Database reset complete'))
}

async function localReset() {
  console.log(pc.dim('  Resetting local Supabase stack (Docker)'))
  console.log()
  const code = await execInteractive('supabase', ['db', 'reset', '--local'])
  if (code !== 0) process.exit(1)
  console.log(pc.green('\n  Local reset complete'))
}

export async function runDb(subcommand?: string, forceRelink = false) {
  const action =
    subcommand ??
    (await (async () => {
      const choice = await select({
        message: 'Database operation',
        options: [
          { value: 'push', label: 'Push migrations', hint: 'non-destructive' },
          { value: 'lint', label: 'Lint migrations' },
          { value: 'local-reset', label: 'Local reset', hint: 'Docker stack' },
          {
            value: 'reset',
            label: 'Linked reset',
            hint: pc.yellow('destructive — drops remote data'),
          },
          { value: 'back', label: pc.dim('← Back') },
        ],
      })
      if (isCancel(choice)) process.exit(0)
      return choice as string
    })())

  switch (action) {
    case 'back':
      return 'back' as const
    case 'push':
      return linkedPush(forceRelink)
    case 'lint':
      return linkedLint(forceRelink)
    case 'reset':
      return linkedReset(forceRelink)
    case 'local-reset':
      return localReset()
    default:
      console.log(pc.red(`  Unknown db command: ${action}`))
      console.log(pc.dim('  Valid: push, lint, reset, local-reset'))
      process.exit(1)
  }
}
