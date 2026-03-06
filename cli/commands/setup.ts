import { intro, outro, confirm, isCancel, spinner } from "@clack/prompts";
import pc from "picocolors";
import { checkPrereqs } from "../utils/prereqs.js";
import { ensureEnv, validateEnv } from "../utils/env.js";
import { execInteractive, execWithSpinner } from "../utils/exec.js";
import { existsSync } from "node:fs";

export async function runSetup() {
  intro(pc.bold("Polterstore Setup Wizard"));

  // 1. Prerequisites
  console.log(pc.bold("\n  Prerequisites\n"));
  const { ok, summary } = checkPrereqs();
  for (const line of summary) console.log(line);
  console.log();

  if (!ok) {
    console.log(pc.red("  Install missing requirements and try again.\n"));
    process.exit(1);
  }

  // 2. Environment
  console.log(pc.bold("  Environment\n"));
  const envOk = await ensureEnv();
  if (!envOk) process.exit(0);
  console.log();

  // 3. Dependencies
  console.log(pc.bold("  Dependencies\n"));
  await execWithSpinner(
    "Installing packages",
    "pnpm install --frozen-lockfile",
  );
  console.log();

  // 4. Supabase link
  console.log(pc.bold("  Supabase\n"));
  const linked = existsSync("supabase/.temp/project-ref");

  if (!linked) {
    console.log(
      pc.dim("  No linked project found. Running supabase link...\n"),
    );
    const code = await execInteractive("supabase", ["link"]);
    if (code !== 0) {
      console.log(
        pc.red(
          "\n  supabase link failed — you can retry with: pnpm polterstore db push\n",
        ),
      );
    }
  } else {
    console.log(pc.dim("  Supabase project already linked\n"));
  }

  // 5. Push migrations
  const { ok: envValid } = validateEnv();
  if (envValid && (linked || existsSync("supabase/.temp/project-ref"))) {
    const push = await confirm({
      message: "Push pending migrations to linked project?",
    });

    if (isCancel(push)) process.exit(0);

    if (push) {
      console.log();
      const code = await execInteractive("supabase", [
        "db",
        "push",
        "--linked",
      ]);
      if (code !== 0) {
        console.log(
          pc.yellow(
            "\n  Migration push failed — run manually: pnpm polterstore db push\n",
          ),
        );
      }
    }
  }

  outro(pc.green("Setup complete! Run pnpm polterstore dev to start developing."));
}
