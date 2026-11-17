export function createPageMetadata({ title, description, robots }) {
  return {
    title,
    description,
    ...(robots ? { robots } : {}),
  };
}
