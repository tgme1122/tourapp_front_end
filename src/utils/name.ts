export const splitName = (full: string) => {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
};

export const joinName = (first: string, last: string) => `${first.trim()} ${last.trim()}`.trim();