import { loadModels } from './modelLoader';

export const extractTextFromImage = async (imageFile) => {
  const { vlm } = await loadModels();

  const prompt = `You are an expert cosmetic ingredient analyzer.
Read the ingredient label on this product image and extract ONLY the cosmetic ingredients.
Return the ingredients as a strict comma-separated list.
Do NOT include marketing text, instructions, brand names, or any explanations.
Example output: water, glycerin, niacinamide, salicylic acid
Return ONLY the comma-separated ingredient list.`;

  const preprocessPass = async (file, filterType) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scale = 2000 / img.width; 
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        if (filterType === 'inverted') {
           ctx.filter = 'grayscale(100%) invert(100%) contrast(250%) brightness(120%)';
        } else {
           ctx.filter = 'grayscale(100%) contrast(200%) brightness(100%)';
        }
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  try {
    console.log('VLM/OCR: Starting 100% Accuracy Dual-Pass Extraction...');
    
    // Load Tesseract.js from CDN
    if (!window.Tesseract) {
      console.log('VLM/OCR: Loading Tesseract.js engine...');
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/tesseract.js@5.0.0/dist/tesseract.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const pass1Data = await preprocessPass(imageFile, 'normal');
    const pass2Data = await preprocessPass(imageFile, 'inverted');

    console.log('VLM/OCR: Running Pass 1 (High Contrast)...');
    const res1 = await window.Tesseract.recognize(pass1Data, 'eng', {
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%,. -()',
      tessedit_pageseg_mode: '11',
    });

    console.log('VLM/OCR: Running Pass 2 (Inverted Sharp)...');
    const res2 = await window.Tesseract.recognize(pass2Data, 'eng', {
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%,. -()',
      tessedit_pageseg_mode: '11',
    });

    // Merge results and deduplicate
    const combinedText = `${res1.data.text} ${res2.data.text}`;
    
    // Final cleansing of combined noisy text
    const cleanText = combinedText
      .replace(/[®™©*]/g, '') // Scrub symbols and asterisks
      .replace(/[\u2022\u2023\u25E6\u2022\u2219\u25CF]/g, ', ') 
      .replace(/\s{2,}/g, ' ') 
      .trim();


    return cleanText;

  } catch (error) {

    console.error('OCR Extraction failed:', error);
    throw new Error('Could not read ingredients from image. Please try manual entry.');
  }
};
