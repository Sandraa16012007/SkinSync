export const parseIngredients = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return [];

  // Remove "ingredients:" prefix and common noise
  const cleanBase = rawText
    .toLowerCase()
    .replace(/^(ingredients|composition|contains)\s*:\s*/i, '')
    .replace(/[\n\r]/g, ', '); // Convert newlines to commas

  return cleanBase
    .split(/[,.;•]/) // Split by common delimiters (comma, dot, semicolon, bullet)
    .map(item => item.replace(/[*_]/g, '').trim()) // Remove markdown bold/italic noise
    .filter(item => item.length > 1); // Filter out single chars or empty noise
};

