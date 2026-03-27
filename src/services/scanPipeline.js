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

    console.log('Pipeline Step 2: Preparing for LLM Analysis...');
    // We pass the rawText DIRECTLY to the LLM now. 
    // The LLM is better at identifying ingredients in noisy OCR than a local regex-based parser.
    const aiResult = await generateCompatibilityReport(rawText, profile);

    console.log('Pipeline Complete!');
    return aiResult;

  } catch (error) {
    console.error('Pipeline Error:', error);
    throw error;
  }
};

