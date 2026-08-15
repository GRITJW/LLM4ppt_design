import path from "node:path";
import { createRequire } from "node:module";

export function loadSharp() {
  const localRequire = createRequire(import.meta.url);
  try {
    return localRequire("sharp");
  } catch (localError) {
    const runtimeModules = process.env.RUNTIME_NODE_MODULES;
    if (!runtimeModules) {
      throw new Error(
        "The sharp package is required. In Codex, set RUNTIME_NODE_MODULES to the bundled Node modules path; otherwise install sharp locally.",
        { cause: localError },
      );
    }
    try {
      const runtimeRequire = createRequire(path.join(path.resolve(runtimeModules), "package.json"));
      return runtimeRequire("sharp");
    } catch (runtimeError) {
      throw new Error(`Unable to load sharp from RUNTIME_NODE_MODULES=${runtimeModules}`, { cause: runtimeError });
    }
  }
}

