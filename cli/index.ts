import { intro, outro, select, isCancel } from "@clack/prompts";
import pc from "picocolors";

const args = process.argv.slice(2);
const command = args[0];
const flags = new Set(args.filter((arg) => arg.startsWith("--")));

function printHelp() {
  console.log(`
  ${pc.bold("URU CLI")} — development launcher

  ${pc.dim("Usage:")}  pnpm uru [command]

  ${pc.dim("Commands:")}
    ${pc.bold("dev")}            Start development server (web or desktop)

  ${pc.dim("Flags:")}
    ${pc.bold("--help")}         Show this help message

  ${pc.dim("Examples:")}
    pnpm uru              Show this help
    pnpm uru dev          Start dev server

  ${pc.dim("Supabase workflows moved to Polterbase:")}
    npx polterbase app setup uru --path .
    npx polterbase app link uru --path .
    npx polterbase app migrate uru push --path .
`);
}

function printMovedCommand(commandName: string) {
  console.log(
    pc.yellow(
      `\n  ${commandName} moved to Polterbase.\n  Use ${pc.bold("npx polterbase app ...")} for setup, link, configure, install, and migrations.\n`,
    ),
  );
}

async function promptMainMenu(): Promise<string> {
  const choice = await select({
    message: "What do you want to do?",
    options: [
      { value: "dev", label: "Start development", hint: "web or desktop" },
    ],
  });

  if (isCancel(choice)) {
    outro(pc.dim("Cancelled"));
    process.exit(0);
  }

  return choice as string;
}

async function runCommand(resolved: string): Promise<"back" | void> {
  switch (resolved) {
    case "dev": {
      const { runDev } = await import("./commands/dev.js");
      return runDev();
    }
    default:
      if (resolved === "setup" || resolved === "db" || resolved === "check") {
        printMovedCommand(resolved);
        return;
      }

      console.log(pc.red(`  Unknown command: ${resolved}`));
      printHelp();
      process.exit(1);
  }
}

async function main() {
  if (flags.has("--help") || command === "help") {
    printHelp();
    return;
  }

  if (command) {
    await runCommand(command);
    return;
  }

  intro(pc.bold("URU"));
  printHelp();
  const choice = await promptMainMenu();
  await runCommand(choice);
  outro(pc.dim("Use Polterbase for Supabase workflows."));
}

main().catch((err) => {
  console.error(pc.red(err.message));
  process.exit(1);
});
