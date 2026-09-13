// Literal full-source search also works on CSS with no comments or syntax errors.
export function searchCss(source, query) {
  const term = String(query).trim().toLowerCase();
  if (!term) return { count: 0, results: [] };
  const lines = String(source).split(/\r?\n/), ranges = [];
  let count = 0;
  lines.forEach((line, index) => {
    const lower = line.toLowerCase();
    let from = 0, found = false, at;
    while ((at = lower.indexOf(term, from)) !== -1) { count++; found = true; from = at + term.length; }
    if (!found) return;
    const start = Math.max(0, index - 2), end = Math.min(lines.length - 1, index + 2);
    const prev = ranges.at(-1);
    if (prev && start <= prev.end + 1) { prev.end = end; prev.matches.push(index + 1); }
    else ranges.push({ start, end, matches: [index + 1] });
  });
  return { count, results: ranges.map(r => ({ line: r.start + 1, endLine: r.end + 1, matches: r.matches, code: lines.slice(r.start, r.end + 1).join('\n') })) };
}
