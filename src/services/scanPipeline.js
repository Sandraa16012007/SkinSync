import { extractTextFromImage } from '../ai/vlmOCR';
import { generateCompatibilityReport, verifyIngredients } from '../ai/compatibilityLLM';

export const scanProduct = async ({ imageFile, ingredientText, profile }) => {
  try {
    let rawText;

    if (ingredientText && ingredientText.trim() !== '') {
      console.log('Pipeline Step 1: Using provided ingredient text...');
      rawText = ingredientText;
    } else if (imageFile) {
      console.log('Pipeline Step 1: Extracting text from image using VLM...');
      rawText = await extractTextFromImage(imageFile);
    } else {
      throw new Error('No image file or ingredient text provided.');
    }

    console.log('Pipeline Step 2: Verifying ingredients with LLM Gatekeeper...');
    const verifiedIngredients = await verifyIngredients(rawText);
    
    console.log('Pipeline Step 3: Performing Clinical Analysis on verified list...');
    const aiResult = await generateCompatibilityReport(verifiedIngredients, profile);

    console.log('Pipeline Complete!');
    return aiResult;


  } catch (error) {
    console.error('Pipeline Error:', error);
    throw error;
  }
};

