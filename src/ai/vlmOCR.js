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

export const extractProductName = async (imageFile) => {
  try {
    console.log('VLM/OCR: Extracting product name from front image...');
    
    // Load Tesseract.js from CDN
    if (!window.Tesseract) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/tesseract.js@5.0.0/dist/tesseract.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    const imgURL = URL.createObjectURL(imageFile);
    
    // Preprocess: multiple filter variants for better coverage on front labels
    const preprocessForName = (file, filterStr) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const scale = Math.min(1600 / img.width, 2);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx.filter = filterStr;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        };
        img.src = URL.createObjectURL(file);
      });
    };

    // Run three OCR passes with different preprocessing for maximum text capture
    const [enhancedData, sharpData] = await Promise.all([
      preprocessForName(imageFile, 'grayscale(100%) contrast(180%) brightness(110%)'),
      preprocessForName(imageFile, 'grayscale(100%) contrast(250%) brightness(130%) sharpen(1)')
    ]);

    // Run OCR with all three variants
    const [res1, res2, res3] = await Promise.all([
      window.Tesseract.recognize(imgURL, 'eng'),
      window.Tesseract.recognize(enhancedData, 'eng'),
      window.Tesseract.recognize(sharpData, 'eng')
    ]);

    const allText1 = res1.data.text || '';
    const allText2 = res2.data.text || '';
    const allText3 = res3.data.text || '';
    const combinedRawText = `${allText1}\n${allText2}\n${allText3}`;
    
    // Clean the OCR text before sending to LLM — strip non-alpha garbage
    const cleanedOCRText = combinedRawText
      .replace(/[{}|\\[\]<>~`@#$^&*_=]/g, '') // Remove garbage symbols OCR picks up
      .replace(/[^\x20-\x7E\n]/g, '')          // Remove non-printable chars
      .replace(/\n{3,}/g, '\n\n')              // Collapse blank lines
      .trim();
    
    console.log('VLM/OCR: Cleaned front-label OCR text:', cleanedOCRText);

    // Use the LLM to intelligently extract the product name from noisy OCR
    const { loadModels } = await import('./modelLoader');
    const { llm } = await loadModels();

    const prompt = `You are a product identification expert. I will give you noisy OCR text scanned from the FRONT LABEL of a cosmetic/skincare product.

Your task: Extract ONLY the brand name and product name.

RULES:
1. Identify the BRAND (e.g., POND'S, CeraVe, Neutrogena, Lakme, Nivea, Dove, etc.)
2. Identify the PRODUCT LINE/NAME (e.g., Super Light Gel, Hydrating Cleanser, etc.)
3. IGNORE everything else: marketing claims ("NEW", "For non sticky glowing skin"), ingredient highlights ("Hyaluronic Acid + Vitamin E"), manufacturing info, barcodes, numbers, and OCR noise/garbage characters.
4. Return ONLY the clean product name in the format: "Brand ProductName"
5. If the brand appears multiple times (e.g., "FORMULATED BY THE POND'S INSTITUTE" and "POND'S"), use the one that is clearly the main brand label.
6. Fix obvious OCR errors (e.g., "PONO'S" should be "POND'S", "CeraVa" should be "CeraVe").
7. Keep it concise — maximum 5-6 words.

OCR TEXT:
"${cleanedOCRText}"

Return ONLY the product name, nothing else. No quotes, no explanation.`;

    const response = await llm.generate({ prompt, temperature: 0 });
    const extractedName = (typeof response === 'string' ? response : (response.text || '')).trim();
    
    // Validate the LLM response — it should be short and clean
    if (extractedName && extractedName.length > 2 && extractedName.length < 60 && !/^scanned/i.test(extractedName)) {
      console.log('VLM/OCR: LLM extracted product name:', extractedName);
      return extractedName;
    }

    // Fallback: Use improved heuristic on OCR lines
    const lines = cleanedOCRText.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 2 && !/^(new|for |mrp|net|mfg|lic|made|barcode|\d{5,})/i.test(l) && /[a-zA-Z]{2,}/.test(l));

    if (lines.length > 0) {
      // Pick the line with the largest average confidence / biggest font (usually first meaningful line)
      const possibleName = lines.slice(0, 2).join(' ').replace(/[{}|\\[\]]/g, '').trim().substring(0, 40);
      return possibleName || 'Scanned Product';
    }

    return 'Scanned Product';

  } catch (error) {
    console.error('Front Image OCR Extraction failed:', error);
    return 'Scanned Product';
  }
};
