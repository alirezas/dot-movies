import * as dotenv from "dotenv";

// Load .env for CLI scripts (Next.js handles this automatically for the web app)
dotenv.config();

export const createProgressBar = (
  current: number,
  total: number,
  width: number = 40
): string => {
  const percentage = Math.round((current / total) * 100);
  const filledWidth = Math.round((current / total) * width);
  const emptyWidth = width - filledWidth;

  const filledBar = "\u2588".repeat(filledWidth);
  const emptyBar = "\u2591".repeat(emptyWidth);

  return `[${filledBar}${emptyBar}] ${percentage}% (${current}/${total})`;
};

export const clearTerminal = () => {
  process.stdout.write("\x1B[2J\x1B[0f");
};

let errorLinesCount = 0;

export const resetErrorCount = () => {
  errorLinesCount = 0;
};

export const writeErrorBelow = (message: string) => {
  process.stdout.write(`\n${message}`);
  errorLinesCount++;
};

const getProgressBarPosition = () => {
  if (errorLinesCount > 0) {
    process.stdout.write(`\x1B[${errorLinesCount}A`);
  }
};

export const updateProgressLine = (message: string) => {
  getProgressBarPosition();

  if (
    typeof process.stdout.clearLine === "function" &&
    typeof process.stdout.cursorTo === "function"
  ) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
  process.stdout.write(message);

  if (errorLinesCount > 0) {
    process.stdout.write(`\x1B[${errorLinesCount}B`);
  }
};

export const clearProgressLine = () => {
  if (
    typeof process.stdout.clearLine === "function" &&
    typeof process.stdout.cursorTo === "function"
  ) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  } else {
    process.stdout.write("\n");
  }
};
