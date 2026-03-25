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

        // If it's the LLM model, return a dermatology evaluation
        return {
          text: "This product contains safe actives like Niacinamide and Salicylic Acid which are great for your profile. However, it contains Fragrance which may cause irritation on sensitive skin. Please patch-test before full application."
        };
      }
    };
  }
};
