export const parseIngredients = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return [];

  return rawText
    .toLowerCase()
    .replace(/^ingredients\s*:\s*/, '') // Remove "ingredients:" prefix
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
};
