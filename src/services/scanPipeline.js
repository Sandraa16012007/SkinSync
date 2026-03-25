import { extractTextFromImage } from '../ai/vlmOCR';
import { parseIngredients } from '../utils/ingredientParser';
import { generateCompatibilityReport } from '../ai/compatibilityLLM';

export const scanProduct = async ({ imageFile, ingredientText, profile }) => {
  try {
    let rawText;

    if (ingredientText && ingredientText.trim() !== '') {
      console.log('Pipeline Step 1: Skipping OCR, using provided ingredient text...');
      rawText = ingredientText;
    } else if (imageFile) {
      console.log('Pipeline Step 1: Extracting text from image using VLM...');
      rawText = await extractTextFromImage(imageFile);
    } else {
      throw new Error('No image file or ingredient text provided.');
    }

    console.log('Pipeline Step 2: Parsing ingredients...');
    const rawIngredients = parseIngredients(rawText);

    if (!rawIngredients.length) {
      throw new Error('Could not detect or parse any ingredients.');
    }

    console.log('Pipeline Step 3: LLM generating full assessment natively...');
    const aiResult = await generateCompatibilityReport(rawIngredients, profile);

    console.log('Pipeline Complete!');
    return aiResult;

  } catch (error) {
    console.error('Pipeline Error:', error);
    throw error;
  }
};
