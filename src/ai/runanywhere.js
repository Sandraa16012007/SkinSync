// Mock implementation of the RunAnywhere SDK for local testing bypass
export const RunAnywhere = {
  loadModel: async (modelName) => {
    console.log(`[RunAnywhere SDK] Initializing local model: ${modelName} ...`);
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      generate: async ({ prompt, image, temperature, max_tokens }) => {
        // Handle Verification Phase (Step 2)
        if (prompt.includes('INCI (International Nomenclature of Cosmetic Ingredients) expert')) {
           const inputMatch = prompt.match(/INPUT TEXT:\s*"([\s\S]*?)"/i);
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
        
        // Split and filter ingredients
        const parsedIngs = rawInput
          .split(/[,;\n•|]/) 
          .map(s => s.trim().replace(/[®™©]/g, ''))
          .filter(s => s.length > 2 && /[a-zA-Z]/.test(s));
        
        console.log(`[AI Agent] Clinical Analysis for Profil: ${skinType} | Concerns: ${concerns}`);
        
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

