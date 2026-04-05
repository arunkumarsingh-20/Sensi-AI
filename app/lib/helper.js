function toText(value) {
  if (value == null) return "";
  return String(value).trim();
}

function formatDateRange(entry = {}) {
  const startDate = toText(entry.startDate) || "Start date not set";
  const endDate = toText(entry.endDate) || "End date not set";

  if (entry.current) {
    return `${startDate} - Present`;
  }

  return `${startDate} - ${endDate}`;
}

export function entriesToMarkdown(entries, type) {
  if (!Array.isArray(entries) || entries.length === 0) return "";

  const heading = toText(type) || "Entries";

  return [
    `## ${heading}`,
    ...entries.map((entry) => {
      const title = toText(entry?.title) || "Untitled";
      const organization = toText(entry?.organization) || "Unknown";
      const description = toText(entry?.description);

      return [
        `### ${title} @ ${organization}`,
        formatDateRange(entry),
        description,
      ]
        .filter(Boolean)
        .join("\n\n");
    }),
  ].join("\n\n");
}
