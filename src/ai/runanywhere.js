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

        // If it's the Vision model, return comma-separated mock ingredients
        if (modelName.includes('VL')) {
          return {
            text: "Water, Glycerin, Niacinamide, Salicylic Acid, Squalane, Fragrance, Sodium Hyaluronate"
          };
        }

        // Dynamically extract the ingredients from the prompt text
        const ingredientsMatch = prompt.match(/Ingredients:\s*(.*?)\n/i);
        const parsedIngs = ingredientsMatch ? ingredientsMatch[1].split(',').map(s => s.trim()).filter(Boolean) : ["Unknown"];

        let score = 90;
        
        const mockIngredients = parsedIngs.map(name => {
          const lower = name.toLowerCase();
          let risk = "low";
          let benefit = "Formulation ingredient";
          
          if (lower.includes('fragrance') || lower.includes('parfum') || lower.includes('alcohol')) {
             risk = "high";
             score -= 25;
             benefit = "Added scent or solvent";
          } else if (lower.includes('acid') || lower.includes('retinol')) {
             risk = "moderate";
             score -= 10;
             benefit = "Active exfoliant or cell turnover";
          } else if (lower.includes('niacinamide') || lower.includes('glycerin') || lower.includes('hyaluronic')) {
             risk = "low";
             benefit = "Hydration or barrier support";
          }

          return { name, benefit, risk };
        });

        score = Math.max(0, Math.min(100, score));
        let verdict = "Excellent";
        if (score < 40) verdict = 'Harmful';
        else if (score < 60) verdict = 'Risky';
        else if (score < 80) verdict = 'Mixed';
        else if (score < 90) verdict = 'Good';

        const mockJSON = {
          score,
          verdict,
          ingredients: mockIngredients,
          warnings: mockIngredients.filter(i => i.risk === 'high').map(i => ({ ingredient: i.name, message: `${i.name} may be an irritant for your profile.`, severity: "high" })),
          conflicts: [],
          explanation: "This is a dynamic local baseline assessment perfectly mapped to the ingredients you explicitly entered."
        };

        return {
          text: JSON.stringify(mockJSON)
        };
      }
    };
  }
};

