const fs = require("fs");
const path = require("path");

const extensions = new Set([".html", ".js", ".css", ".ts", ".tsx"]);
const ignored = new Set(["node_modules", "dist", ".git"]);

const replacements = new Map([
  ["\u00e2\u0152\u201e", "\u2304"], // âŒ„ -> ⌄
  ["Fran\u00c3\u00a7ais", "Fran\u00e7ais"], // FranÃ§ais -> Français
  ["\u00e2\u20ac\u2122", "\u2019"], // â€™ -> ’
  ["\u00e2\u0153\u201c", "\u2713"], // âœ“ -> ✓
  ["\u00e2\u0178\u00b6", "\u27f6"], // âŸ¶ -> ⟶
  ["\u00c3\u2014", "\u00d7"], // Ã— -> ×
  ["\u00c2\u00ae", "\u00ae"], // Â® -> ®
  ["\u00e2\u20ac\u00ba", "\u203a"], // â€º -> ›
  ["\u00e2\u20ac\u00a2", "\u2022"], // â€¢ -> •
  ["\u00e2\u20ac\u201d", "\u2014"], // â€” -> —
  ["\u00e2\u2020\u2014", "\u2197"], // â†— -> ↗
  ["\u00e2\u20ac\u00a6", "\u2026"], // â€¦ -> …
  ["\u00c2\u00a9", "\u00a9"], // Â© -> ©
  ["\u00e2\u20ac\u0153", "\u201c"], // â€œ -> “
  ["\u00e2\u20ac\u009d", "\u201d"], // broken right quote -> ”
  ["\u00e2\u20ac\u201c", "\u2013"], // â€“ -> –
]);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full);
      continue;
    }

    if (!extensions.has(path.extname(entry.name).toLowerCase())) continue;

    let text = fs.readFileSync(full, "utf8");
    let updated = text;

    for (const [bad, good] of replacements) {
      updated = updated.split(bad).join(good);
    }

    // Remove invalid control characters while keeping tabs/newlines.
    updated = updated.replace(
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g,
      ""
    );

    if (updated !== text) {
      fs.writeFileSync(full, updated, "utf8");
      console.log("Fixed:", full);
    }
  }
}

walk(process.cwd());

console.log("Encoding cleanup complete.");