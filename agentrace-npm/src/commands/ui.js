import { createApp, PORT, TRACES_DIR } from "../server.js";
import { existsSync, mkdirSync } from "fs";
import { createServer } from "http";
import chalk from "chalk";
import ora from "ora";
import open from "open";

export async function startUI() {
  if (!existsSync(TRACES_DIR)) {
    mkdirSync(TRACES_DIR, { recursive: true });
  }

  const spinner = ora({
    text: "Starting AgentTrace...",
    color: "magenta",
  }).start();

  const app = createApp();
  const server = createServer(app);

  await new Promise((resolve, reject) => {
    server.once("error", (error) => {
      if (error?.code === "EADDRINUSE") {
        spinner.stop();
        console.log("");
        console.log("  Port 7823 is already in use.");
        console.log("  AgentTrace may already be running.");
        console.log("  Open: http://localhost:7823");
        console.log("");
        process.exit(0);
      }

      reject(error);
    });

    server.listen(PORT, () => {
      server.removeAllListeners("error");
      resolve();
    });
  });

  spinner.stop();

  console.log("");
  console.log(
    `  ${chalk.hex("#7c6af7")("◈ AgentTrace")}  ${chalk.gray("v0.1.0")}`,
  );
  console.log("");
  console.log(`  ${chalk.white("UI       ")}${chalk.cyan("http://localhost:7823")}`);
  console.log(`  ${chalk.white("Traces   ")}${chalk.gray(TRACES_DIR)}`);
  console.log(
    `  ${chalk.white("Runtime  ")}${chalk.gray(`Node.js ${process.version}`)}`,
  );
  console.log("");
  console.log(
    `${chalk.gray("  Watching for new traces. Press ")}${chalk.white("Ctrl+C")}${chalk.gray(" to stop.")}`,
  );
  console.log("");

  try {
    await open("http://localhost:7823");
  } catch {
    // Best effort: keep server running even if browser launch fails.
  }

  process.once("SIGINT", () => {
    console.log(chalk.gray("\n\n  AgentTrace stopped.\n"));
    process.exit(0);
  });

  await new Promise(() => {});
}
