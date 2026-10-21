import { afterAll, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdtemp, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const SKILL_MD_PATH = join(import.meta.dir, "SKILL.md");

function documentedHomeLockPaths(skillMd: string, home: string): string[] {
  const quoted = [...skillMd.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  return quoted
    .filter((path) => path.includes("skills-lock.json") && path.startsWith("~/"))
    .map((path) => path.replace(/^~/, home));
}

function run(command: string, args: string[], env: NodeJS.ProcessEnv, cwd: string) {
  return new Promise<{ stdout: string; stderr: string; code: number }>((resolve, reject) => {
    const child = spawn(command, args, { env, cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });
  });
}

const isolatedHome = await mkdtemp(join(tmpdir(), "improve-skill-lock-"));
afterAll(async () => {
  await rm(isolatedHome, { recursive: true, force: true });
});

test("following improve-skill §1 finds the npx global lockfile and its source field", async () => {
  const skillMd = await readFile(SKILL_MD_PATH, "utf8");
  const documentedLocks = documentedHomeLockPaths(skillMd, isolatedHome);
  expect(documentedLocks.length).toBeGreaterThan(0);

  await mkdir(join(isolatedHome, ".claude"), { recursive: true });

  const env = {
    ...process.env,
    HOME: isolatedHome,
    DISABLE_TELEMETRY: "1",
    DO_NOT_TRACK: "1",
  };
  delete env.XDG_STATE_HOME;
  delete env.XDG_CONFIG_HOME;
  delete env.XDG_DATA_HOME;

  const install = await run(
    "npx",
    [
      "--yes",
      "skills@1.7.4",
      "add",
      "vercel-labs/agent-skills",
      "--skill",
      "writing-guidelines",
      "-a",
      "claude-code",
      "-g",
      "-y",
      "--json",
    ],
    env,
    isolatedHome,
  );

  expect(install.code, `${install.stdout}\n${install.stderr}`).toBe(0);

  const actualLockPath = join(isolatedHome, ".agents", ".skill-lock.json");
  expect(existsSync(actualLockPath), `${install.stdout}\n${install.stderr}`).toBe(true);
  const actualLock = JSON.parse(await readFile(actualLockPath, "utf8")) as {
    skills?: Record<string, { source?: string }>;
  };
  expect(actualLock.skills?.["writing-guidelines"]?.source).toBe("vercel-labs/agent-skills");

  const existingDocumentedLocks = documentedLocks.filter((path) => existsSync(path));
  expect(
    existingDocumentedLocks,
    `skill §1 lock paths were missing after a real global npx install: ${documentedLocks.join(", ")}`,
  ).not.toEqual([]);

  const sources = await Promise.all(
    existingDocumentedLocks.map(async (path) => {
      const lock = JSON.parse(await readFile(path, "utf8")) as {
        skills?: Record<string, { source?: string }>;
      };
      return lock.skills?.["writing-guidelines"]?.source;
    }),
  );
  expect(sources).toContain("vercel-labs/agent-skills");
});
