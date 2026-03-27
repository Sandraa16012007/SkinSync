// Mock implementation of the RunAnywhere SDK for local testing bypass
export const RunAnywhere = {
  loadModel: async (modelName) => {
    console.log(`[RunAnywhere SDK] Initializing local model: ${modelName} ...`);
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      generate: async ({ prompt, image, temperature, max_tokens }) => {
        // Simulate inference latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulated LLM Intelligence - Profile-Aware Logic
        const inputMatch = prompt.match(/INPUT TEXT \(Potentially noisy OCR scan\):\s*"([\s\S]*?)"/i);
        const rawInput = inputMatch ? inputMatch[1] : "";
        
        // Extract Profile context from prompt
        const skinType = (prompt.match(/- Skin Type:\s*(.*)/i) || [])[1] || "normal";
        const concerns = (prompt.match(/- Specific Concerns:\s*(.*)/i) || [])[1] || "";
        const avoidList = (prompt.match(/- Ingredients to Avoid:\s*(.*)/i) || [])[1] || "";
        
        // Split and filter ingredients
        const parsedIngs = rawInput
          .split(/[,;\n•|]/) 
          .map(s => s.trim().replace(/[®™©]/g, ''))
          .filter(s => s.length > 2 && /[a-zA-Z]/.test(s));
        
        console.log(`[AI Agent] Clinical Analysis for Profil: ${skinType} | Concerns: ${concerns}`);
        
        const ingredients = parsedIngs.map(name => {
          const lower = name.toLowerCase();
          let risk = "low";
          let benefit = "Formulation component";
          let warning = null;
          
          if (/acid|glycol|retin|oxide|peroxide/.test(lower)) {
             risk = "moderate";
             benefit = `Active compound used for ${concerns.includes('acne') ? 'breakout control' : 'exfoliation'}`;
             warning = `Potential for irritation given your ${skinType} base. Patch test recommended.`;
          } else if (/alcohol|parfum|fragrance|sulfate|paraben/.test(lower)) {
             risk = "high";
             benefit = "Synthetic additive/preservative";
             warning = `Known irritant for ${skinType} skin. May exacerbate ${concerns}.`;
          } else if (/extract|oil|butter|water|aqua|glycerin|hyaluron/.test(lower)) {
             risk = "low";
             benefit = `${skinType === 'dry' ? 'Deeply hydrating' : 'Soothing'} base component`;
          }

          // Force 'Avoid' list match to be high risk with strong warning
          if (avoidList.toLowerCase().includes(lower)) {
            risk = "high";
            warning = `EXPLICIT AVOIDANCE: You marked this as a prohibited ingredient.`;
          }

          return { name, benefit, risk, warning };
        });


        const warnings = [];
        ingredients.forEach(i => {
          const lower = i.name.toLowerCase();
          // Check against Avoid list
          if (avoidList.toLowerCase().includes(lower)) {
            warnings.push({ 
              ingredient: i.name, 
              message: `CRITICAL: You explicitly listed ${i.name} in your Avoid list. Do not use!`, 
              severity: "high" 
            });
          }
          // Profile specific logic
          else if (skinType === 'dry' && (lower.includes('alcohol') || lower.includes('acid'))) {
            warnings.push({ 
              ingredient: i.name, 
              message: `${i.name} may worsen your ${skinType} skin by causing additional dehydration.`, 
              severity: "moderate" 
            });
          }
          else if (concerns.includes('acne') && (lower.includes('oil') || lower.includes('butter'))) {
            warnings.push({ 
              ingredient: i.name, 
              message: `${i.name} detected. This may be too heavy for your acne-prone concerns.`, 
              severity: "moderate" 
            });
          }
        });

        const score = ingredients.reduce((acc, ing) => {
          if (ing.risk === 'high') return acc - 30;
          if (ing.risk === 'moderate') return acc - 15;
          return acc;
        }, 100);

        const finalScore = Math.max(10, Math.min(100, score));
        
        let verdict = "Safe";
        if (finalScore < 50) verdict = "Avoid";
        else if (finalScore < 70) verdict = "Caution";
        else if (finalScore < 85) verdict = "Mostly Safe";

        const mockJSON = {
          score: finalScore,
          verdict,
          ingredients,
          warnings,
          conflicts: [],
          explanation: `Based on your ${skinType} skin and concerns regarding ${concerns}, this product is rated ${finalScore}%. ${warnings.length > 0 ? 'See warnings below for potential irritants.' : 'No major red flags detected for your profile.'}`
        };




        return {
          text: JSON.stringify(mockJSON)
        };
      }
    };
  }
};

