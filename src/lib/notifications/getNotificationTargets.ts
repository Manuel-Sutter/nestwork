export function getNotificationTargets(actorUserId: string, allUserIds: string[]): string[] {
  return allUserIds.filter((id) => id !== actorUserId);
}
