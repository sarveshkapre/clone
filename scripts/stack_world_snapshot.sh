#!/usr/bin/env bash
set -euo pipefail

OUT_FILE="${1:-docs/stack_world_snapshot.md}"
SNAPSHOT_DATE="${SNAPSHOT_DATE:-$(date -u +%Y-%m-%d)}"

mkdir -p "$(dirname "$OUT_FILE")"

{
  echo "# Stack World Snapshot (${SNAPSHOT_DATE})"
  echo
  echo "Generated from live npm registry metadata."
  echo
  echo "| Package | Latest npm version | Why it matters | Official docs |"
  echo "|---|---:|---|---|"
  node <<'NODE'
const { execSync } = require("node:child_process");

const specs = [
  { pkg: "next", why: "App Router/runtime foundation", docs: "https://nextjs.org/docs" },
  { pkg: "react", why: "Core rendering/runtime behavior", docs: "https://react.dev/blog" },
  { pkg: "tailwindcss", why: "Design system utility layer", docs: "https://tailwindcss.com/docs" },
  { pkg: "shadcn", why: "Composable UI component generator", docs: "https://ui.shadcn.com/docs" },
  { pkg: "@radix-ui/react-dialog", why: "Accessible primitive baseline", docs: "https://www.radix-ui.com/primitives/docs/overview/introduction" },
  { pkg: "@tanstack/react-query", why: "Server-state caching/sync", docs: "https://tanstack.com/query/latest" },
  { pkg: "@tanstack/react-virtual", why: "Large list/table performance", docs: "https://tanstack.com/virtual/latest" },
  { pkg: "react-konva", why: "High-performance interactive canvas", docs: "https://konvajs.org/docs/react/" },
  { pkg: "konva", why: "Canvas engine backing react-konva", docs: "https://konvajs.org/docs/" },
  { pkg: "liveblocks", why: "Realtime collaboration and presence", docs: "https://liveblocks.io/docs" },
];

function latestVersion(pkg) {
  try {
    const command = `npm view ${JSON.stringify(pkg)} version`;
    return execSync(command, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "unavailable";
  }
}

for (const spec of specs) {
  const version = latestVersion(spec.pkg);
  const docs = `[link](${spec.docs})`;
  console.log(`| \`${spec.pkg}\` | ${version} | ${spec.why} | ${docs} |`);
}
NODE
  echo
  echo "## Notes"
  echo "- Re-run this script before major upgrades to refresh recommendations."
  echo "- Command: \`./scripts/stack_world_snapshot.sh\`"
} > "$OUT_FILE"

echo "Wrote $OUT_FILE"
