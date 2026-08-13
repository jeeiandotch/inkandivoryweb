// Simple in-memory presence tracker. A user may have multiple open tabs/sockets,
// so we count connections per user and only consider them offline at zero.
const onlineCounts = new Map();

export function markOnline(userId) {
  onlineCounts.set(userId, (onlineCounts.get(userId) || 0) + 1);
}

export function markOffline(userId) {
  const count = (onlineCounts.get(userId) || 1) - 1;
  if (count <= 0) {
    onlineCounts.delete(userId);
  } else {
    onlineCounts.set(userId, count);
  }
}

export function isUserOnline(userId) {
  return onlineCounts.has(userId);
}
