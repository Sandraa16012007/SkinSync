import { extractTextFromImage } from '../ai/vlmOCR';
import { parseIngredients } from '../utils/ingredientParser';
import { calculateCompatibility } from '../utils/scoreCalculator';
import { generateExplanation } from '../ai/compatibilityLLM';

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
    const ingredients = parseIngredients(rawText);

    if (!ingredients.length) {
      throw new Error('Could not detect or parse any ingredients.');
    }

    console.log('Pipeline Step 3: Calculating compatibility score...');
    const { score, safe, risky } = calculateCompatibility(ingredients, profile);

    console.log('Pipeline Step 4: Generating explanation from LLM...');
    const explanation = await generateExplanation({
      profile,
      safe,
      risky,
      score
    });

    console.log('Pipeline Complete!');
    return {
      ingredients,
      score,
      safe,
      risky,
      explanation
    };
  } catch (error) {
    console.error('Pipeline Error:', error);
    throw error;
  }
};
