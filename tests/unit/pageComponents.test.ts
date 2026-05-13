import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const componentRoot = resolve(repoRoot, "src/components");
const appFile = resolve(repoRoot, "src/App.vue");
const allowedRoots = [
  resolve(componentRoot, "ui"),
  resolve(componentRoot, "layout")
];
const nativeTagPattern =
  /<\/?(?:a|article|aside|button|dd|div|dl|dt|fieldset|footer|form|h1|h2|h3|h4|h5|h6|header|hr|input|label|li|main|nav|ol|p|section|select|span|strong|textarea|ul)\b/;

function isAllowedImplementationFile(filePath: string): boolean {
  return allowedRoots.some((root) => filePath.startsWith(`${root}/`));
}

function collectVueFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const filePath = resolve(directory, entry);
    const fileStat = statSync(filePath);
    if (fileStat.isDirectory()) {
      return collectVueFiles(filePath);
    }
    return filePath.endsWith(".vue") ? [filePath] : [];
  });
}

function templateSource(filePath: string): string {
  const source = readFileSync(filePath, "utf8");
  return source.match(/<template>([\s\S]*)<\/template>/)?.[1] ?? "";
}

describe("page component structure", () => {
  it("keeps native HTML tags inside ui and layout primitives", () => {
    const files = [...collectVueFiles(componentRoot), appFile]
      .filter((filePath) => !isAllowedImplementationFile(filePath));
    const offenders = files
      .filter((filePath) => nativeTagPattern.test(templateSource(filePath)))
      .map((filePath) => relative(repoRoot, filePath));

    expect(offenders).toEqual([]);
  });
});
