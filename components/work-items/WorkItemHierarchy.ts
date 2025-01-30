export const isValidDropTarget = (sourceType: string, targetType: string): boolean => {
  // Epics can't be dropped under anything
  if (sourceType === "epic") return false;

  // Features can only be dropped under epics
  if (sourceType === "feature") return targetType === "epic";

  // Stories can be dropped under epics or features
  if (sourceType === "story") return targetType === "epic" || targetType === "feature";

  // Tasks can only be dropped under stories
  if (sourceType === "task") return targetType === "story";

  return false;
}; 