
export function generateIncidentReference(): string {
  const year = new Date().getFullYear();
  const suffix = (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).toUpperCase().slice(-6);
  return `INC-${year}-${suffix}`;
}

export function generatePublicReference(): string {
  const year = new Date().getFullYear();
  // Use timestamp + random for collision-safe, auth-free reference generation
  const suffix = (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).toUpperCase().slice(-6);
  return `PUB-${year}-${suffix}`;
}
