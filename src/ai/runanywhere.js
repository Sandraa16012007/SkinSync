// Mock implementation of the RunAnywhere SDK for local testing bypass
export const RunAnywhere = {
  loadModel: async (modelName) => {
    console.log(`[RunAnywhere SDK] Initializing local model: ${modelName} ...`);
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      generate: async ({ prompt, image, temperature, max_tokens }) => {
        // Handle Product Name Extraction (Front Label)
        if (prompt.includes('product identification expert')) {
          const ocrMatch = prompt.match(/OCR TEXT:\s*"([\s\S]*?)"\s*\n\s*Return/i);
          const ocrText = ocrMatch ? ocrMatch[1] : '';
          
          // Clean the OCR text aggressively before analysis
          const cleanOCR = ocrText
            .replace(/[{}|\\[\]<>~`@#$^&*_=]/g, ' ')  // Replace garbage with spaces
            .replace(/[^\x20-\x7E\n]/g, '')             // Remove non-printable chars
            .replace(/\s{2,}/g, ' ')                     // Collapse whitespace
            .trim();
          
          // Use intelligent keyword matching to find brand + product name
          const lines = cleanOCR.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 1);
          
          // Known brand patterns — generous matching to handle OCR noise
          const brandPatterns = [
            { regex: /p\s*o\s*n\s*d\s*'?\s*s/i, brand: "POND'S" },
            { regex: /cerave/i, brand: "CeraVe" },
            { regex: /neutrogena/i, brand: "Neutrogena" },
            { regex: /nivea/i, brand: "Nivea" },
            { regex: /lakm[eé]/i, brand: "Lakme" },
            { regex: /dove/i, brand: "Dove" },
            { regex: /olay/i, brand: "Olay" },
            { regex: /garnier/i, brand: "Garnier" },
            { regex: /l'?oreal|loreal/i, brand: "L'Oreal" },
            { regex: /biotique/i, brand: "Biotique" },
            { regex: /mamaearth/i, brand: "Mamaearth" },
            { regex: /himalaya/i, brand: "Himalaya" },
            { regex: /the\s*ordinary/i, brand: "The Ordinary" },
            { regex: /minimalist/i, brand: "Minimalist" },
            { regex: /plum/i, brand: "Plum" },
            { regex: /simple/i, brand: "Simple" },
            { regex: /clean\s*&?\s*clear/i, brand: "Clean & Clear" },
            { regex: /vaseline/i, brand: "Vaseline" },
            { regex: /aveeno/i, brand: "Aveeno" },
            { regex: /st\.?\s*ives/i, brand: "St. Ives" },
            { regex: /clinique/i, brand: "Clinique" },
            { regex: /cetaphil/i, brand: "Cetaphil" },
            { regex: /johnsons|johnson'?s/i, brand: "Johnson's" },
            { regex: /pears/i, brand: "Pears" },
            { regex: /lux/i, brand: "Lux" },
            { regex: /fair.?lovely|glow.?lovely/i, brand: "Glow & Lovely" },
          ];

          let detectedBrand = '';
          for (const bp of brandPatterns) {
            if (bp.regex.test(cleanOCR)) {
              detectedBrand = bp.brand;
              break;
            }
          }

          // Product type keywords to look for — ordered by specificity
          const productKeywords = [
            /super\s*light\s*gel/i, 
            /oil\s*free\s*moistur\w*/i,
            /hydrat\w*\s*(cleanser|cream|lotion|gel|moistur\w*)/i,
            /face\s*wash/i, /sun\s*screen/i, /sun\s*block/i,
            /body\s*lotion/i, /night\s*cream/i, /day\s*cream/i, /bb\s*cream/i,
            /eye\s*cream/i, /lip\s*balm/i,
            /moistur\w*/i, /cleanser/i, /serum/i,
            /toner/i, /cream/i, /lotion/i, /gel/i,
            /foundation/i, /primer/i, /mask/i, /scrub/i, /exfoliat\w*/i,
            /mist/i, /spray/i, /balm/i, /butter/i, /oil/i, /foam/i, /mousse/i,
            /shampoo/i, /conditioner/i,
          ];

          let detectedProduct = '';
          for (const pk of productKeywords) {
            const match = cleanOCR.match(pk);
            if (match) {
              detectedProduct = match[0].replace(/\s+/g, ' ').trim();
              // Title case it
              detectedProduct = detectedProduct.split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');
              break;
            }
          }

          let finalName = '';
          if (detectedBrand && detectedProduct) {
            finalName = `${detectedBrand} ${detectedProduct}`;
          } else if (detectedBrand) {
            finalName = detectedBrand;
          } else if (detectedProduct) {
            finalName = detectedProduct;
          } else {
            // Last resort: grab the longest meaningful line
            const meaningfulLines = lines
              .filter(l => l.length > 3 && !/^(new|for |ingredients|mrp|net|mfg|lic|made|formulated|barcode|\d{4,})/i.test(l))
              .filter(l => /[a-zA-Z]{3,}/.test(l))
              .map(l => l.replace(/[{}|\\[\]<>]/g, '').trim())
              .filter(l => l.length > 2);
            finalName = meaningfulLines.length > 0 ? meaningfulLines[0].substring(0, 40) : 'Scanned Product';
          }

          console.log(`[AI Agent] Extracted product name: "${finalName}" from front label OCR`);
          return { text: finalName };
        }
        
        // Handle Verification Phase (Step 2)
        if (prompt.includes('INCI (International Nomenclature of Cosmetic Ingredients) expert')) {
           const inputMatch = prompt.match(/INPUT TEXT:\s*"([\s\S]*)"/i);
           const rawInput = inputMatch ? inputMatch[1] : "";
           
           // Mock Verification: Lowercase, Unique, and Filter fragments
           const verifiedSet = new Set(
             rawInput.split(/[,;\n•|]/)
               .map(s => s.trim().toLowerCase())
               .filter(s => s.length > 3 && /[a-z]/.test(s))
           );
           
           const verified = Array.from(verifiedSet).join(', ');
           console.log(`[AI Verifier] Finalized ${verifiedSet.size} unique, clean ingredients.`);
           return { text: verified };
        }


        // Simulate inference latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulated LLM Intelligence - Profile-Aware Logic

        const inputMatch = prompt.match(/INPUT TEXT \(Potentially noisy OCR scan\):\s*"([\s\S]*?)"/i);
        const rawInput = inputMatch ? inputMatch[1] : "";
        
        // Extract Profile context from prompt
        const skinType = (prompt.match(/- Skin Type:\s*(.*)/i) || [])[1] || "normal";
        const concerns = (prompt.match(/- Specific Concerns:\s*(.*)/i) || [])[1] || "";
        const avoidList = (prompt.match(/- Ingredients to Avoid:\s*(.*)/i) || [])[1] || "";
        
        // Clean raw input by removing stuff before 'ingredients' and admin blurbs at the end
        let cleanedInput = rawInput;
        const ingMatch = cleanedInput.match(/ingredients\s*[:\-]?\s*(.*)/i);
        if (ingMatch) {
          cleanedInput = ingMatch[1];
        }
        cleanedInput = cleanedInput.replace(/(mrp|net wt|mfg|made in|lic|unit|toll free|customer care).*$/i, '');

        // Split and filter ingredients
        const parsedIngs = cleanedInput
          .split(/[,;\n•|]/) 
          .map(s => s.trim().replace(/[®™©*.]/g, ''))
          .filter(s => s.length > 2 && /[a-zA-Z]/.test(s) && !/^(mrp|net|mfg|lic|unit|rs|incl)/i.test(s));
        
        console.log(`[AI Agent] Clinical Analysis for Profile: ${skinType} | Concerns: ${concerns}`);
        
        const ingredients = parsedIngs.map(name => {
          const lower = name.toLowerCase();
          let risk = "low";
          let safety_status = "Safe";
          let benefit = `${skinType === 'dry' ? 'Hydrating' : 'Stabilizing'} agent`;
          let warning = null;
          
          if (/acid|glycol|retin|oxide|peroxide/.test(lower)) {
             risk = "moderate";
             safety_status = "Caution";
             benefit = `Targeted active for ${concerns.includes('acne') ? 'pore congestion' : 'renewal'}`;
             warning = `May cause sensitivity on ${skinType} skin.`;
          } else if (/alcohol|parfum|fragrance|sulfate|paraben/.test(lower)) {
             risk = "high";
             safety_status = "Danger";
             benefit = "Synthetic stabilizer";
             warning = `High irritation risk for ${skinType} skin.`;
          }

          if (avoidList.toLowerCase().includes(lower)) {
            risk = "high";
            safety_status = "Danger";
            warning = `CONFLICT: Prohibited by user profile.`;
          }

          return { name, benefit, risk, warning, safety_status };
        });

        const dangerousCount = ingredients.filter(i => i.safety_status === 'Danger').length;
        const cautionCount = ingredients.filter(i => i.safety_status === 'Caution').length;
        const hasAvoided = ingredients.some(i => i.warning && i.warning.includes('CONFLICT'));
        
        let finalScore = 100 - (dangerousCount * 40) - (cautionCount * 15);
        
        // Strict Veto Caps
        if (hasAvoided) finalScore = Math.min(finalScore, 20);
        else if (dangerousCount > 0) finalScore = Math.min(finalScore, 50);
        else if (cautionCount > 0) finalScore = Math.min(finalScore, 75);

        finalScore = Math.max(10, Math.min(100, finalScore));

        
        let verdict = "Safe";
        if (finalScore < 40) verdict = "Avoid";
        else if (finalScore < 70) verdict = "Caution";
        else if (finalScore < 85) verdict = "Mostly Safe";

        const mockJSON = {
          score: finalScore,
          verdict,
          ingredients,
          warnings: ingredients.filter(i => i.safety_status !== 'Safe').map(i => ({
            ingredient: i.name,
            message: i.warning,
            severity: i.safety_status === 'Danger' ? 'high' : 'moderate'
          })),
          explanation: `Clinical analysis complete. Product suitability for ${skinType} skin is ${finalScore}%. ${dangerousCount > 0 ? 'Critical conflicts detected.' : 'Generally safe formulation.'}`
        };

        return {
          text: JSON.stringify(mockJSON)
        };
      }
    };
  }
};
