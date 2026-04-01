import { extractTextFromImage, extractProductName } from '../ai/vlmOCR';
import { generateCompatibilityReport, verifyIngredients } from '../ai/compatibilityLLM';

export const scanProduct = async ({ frontImageFile, imageFile, ingredientText, profile }) => {
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

    let extractedName = null;
    if (frontImageFile) {
      console.log('Pipeline Step 1.5: Detecting product name from front image...');
      extractedName = await extractProductName(frontImageFile);
    }

    console.log('Pipeline Step 2: Verifying ingredients with LLM Gatekeeper...');
    const verifiedIngredients = await verifyIngredients(rawText);
    
    console.log('Pipeline Step 3: Performing Clinical Analysis on verified list...');
    const aiResult = await generateCompatibilityReport(verifiedIngredients, profile);

    console.log('Pipeline Complete!');
    return { ...aiResult, extractedName, profile, verifiedIngredients };

  } catch (error) {
    console.error('Pipeline Error:', error);
    throw error;
  }
};
