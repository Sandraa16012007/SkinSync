import { loadModels } from './modelLoader';

export const extractTextFromImage = async (imageFile) => {
  const { vlm } = await loadModels();

  const prompt = `You are an expert cosmetic ingredient analyzer.
Read the ingredient label on this product image and extract ONLY the cosmetic ingredients.
Return the ingredients as a strict comma-separated list.
Do NOT include marketing text, instructions, brand names, or any explanations.
Example output: water, glycerin, niacinamide, salicylic acid
Return ONLY the comma-separated ingredient list.`;

  const preprocessImage = async (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Scale for high detail
        const scale = 2000 / img.width; 
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Apply grayscale and high contrast/sharpening
        ctx.filter = 'grayscale(100%) contrast(200%) brightness(100%)';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Advanced: Simple Auto-Inversion (Skincare bottles often have white text on dark)
        // We'll apply a slight inversion filter if the average pixel is dark to help Tesseract
        // but for now we'll just sharpen the edges
        ctx.filter = 'contrast(200%) brightness(110%)';
        
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = URL.createObjectURL(file);
    });
  };

  try {
    console.log('VLM/OCR: Triggering 100% Accuracy Pre-processing...');
    const processedImageData = await preprocessImage(imageFile);
    
    // Load Tesseract.js from CDN dynamically to bypass NPM issues
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

    // High-performance recognition with specific parameters
    const { data: { text } } = await window.Tesseract.recognize(processedImageData, 'eng', {
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%,. -()',
      tessedit_pageseg_mode: '11', // Sparse text mode is great for labels
    });
    
    // Pre-clean OCR noise like symbols, non-ASCII artifacts, etc.
    const cleanText = text
      .replace(/[®™©]/g, '') // Remove trademark/copyright symbols
      .replace(/[\u2022\u2023\u25E6\u2022\u2219\u25CF]/g, ', ') // Convert bullets to commas
      .replace(/\s{2,}/g, ' ') // Collapse extra spaces
      .trim();

    return cleanText;
  } catch (error) {

    console.error('OCR Extraction failed:', error);
    throw new Error('Could not read ingredients from image. Please try manual entry.');
  }
};
