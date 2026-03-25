import { loadModels } from './modelLoader';

export const extractTextFromImage = async (imageFile) => {
  const { vlm } = await loadModels();

  const prompt = `You are an expert cosmetic ingredient analyzer.
Read the ingredient label on this product image and extract ONLY the cosmetic ingredients.
Return the ingredients as a strict comma-separated list.
Do NOT include marketing text, instructions, brand names, or any explanations.
Example output: water, glycerin, niacinamide, salicylic acid
Return ONLY the comma-separated ingredient list.`;

  try {
    // Assuming standard RunAnywhere multimodal API structure
    const response = await vlm.generate({
      prompt: prompt,
      image: imageFile,
      temperature: 0.1, // Keep it deterministic
    });

    // Handle different possible response formats from RunAnywhere SDK
    const extractedText = typeof response === 'string' 
      ? response 
      : (response.text || response.content || '');

    return extractedText.trim();
  } catch (error) {
    console.error('Failed to extract text from image using VLM:', error);
    throw new Error('VLM extraction failed');
  }
};
