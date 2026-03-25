import { ingredientDB } from './ingredientKnowledgeBase';

export const analyzeCompatibility = (ingredients, profile) => {
  let score = 70;
  const warnings = [];
  const conflicts = [];
  const processedIngredients = [];
  
  const safeList = [];
  const riskyList = [];

  const skinType = (profile?.skinType || 'normal').toLowerCase();
  const concerns = (profile?.concerns || []).map(c => c.toLowerCase());
  const avoidList = (profile?.avoid || []).map(a => a.toLowerCase());

  let strongIrritantCount = 0;

  ingredients.forEach(rawName => {
    const name = rawName.trim().toLowerCase();
    if (!name) return;

    const data = ingredientDB[name];
    
    let role = "Unknown";
    let benefit = "Ingredient used in cosmetic formulations";
    let risk = "unknown";
    
    let penalty = 0;
    let bonus = 0;
    let isRisky = false;

    const isDry = skinType === 'dry' || concerns.includes('dryness') || concerns.includes('dehydration');
    const isSensitive = skinType === 'sensitive' || concerns.includes('sensitivity') || concerns.includes('irritation') || concerns.includes('irritated');
    const isAcne = skinType === 'oily' || concerns.includes('acne') || concerns.includes('breakouts');

    if (data) {
      role = data.role || role;
      benefit = data.benefit || benefit;
      risk = data.risk || risk;
      const formattedName = data.name;

      // Forced Avoids
      if (avoidList.includes(name)) {
        penalty += 20;
        isRisky = true;
        strongIrritantCount++;
        warnings.push({ ingredient: formattedName, message: `Contains ${formattedName} which is on your avoid list.` });
      }

      // Dry skin penalties
      if (isDry) {
        if (name.includes('alcohol') && !name.includes('cetearyl') && !name.includes('stearyl') && !name.includes('cetyl') && !name.includes('benzyl')) {
          penalty += 20;
          isRisky = true;
          strongIrritantCount++;
          warnings.push({ ingredient: formattedName, message: `Drying alcohols severely strip dry skin.` });
        }
        if (name === 'salicylic acid') {
          penalty += 10;
          isRisky = true;
          warnings.push({ ingredient: formattedName, message: `Salicylic Acid can be too drying for dry skin.` });
        }
        if (role.toLowerCase().includes('fragrance') || name === 'parfum') {
          penalty += 10;
          isRisky = true;
          warnings.push({ ingredient: formattedName, message: `Fragrance can compromise a dry skin barrier.` });
        }
      }

      // Sensitive skin penalties
      if (isSensitive) {
        if (role.toLowerCase().includes('fragrance') || name === 'parfum' || name.includes('essential oil') || name === 'benzyl alcohol') {
          penalty += 20;
          isRisky = true;
          strongIrritantCount++;
          warnings.push({ ingredient: formattedName, message: `${formattedName} is a strong irritant for sensitive skin.` });
        }
      }

      // Acne skin penalties
      if (isAcne) {
        if (data.comedogenicRating >= 3 || data.acneSafe === false) {
          penalty += 10;
          isRisky = true;
          warnings.push({ ingredient: formattedName, message: `High comedogenic rating; may clog pores.` });
        }
      }

      // Raw Irritation mapping
      if (!isRisky) {
        if (data.irritationPotential === 'high') {
          penalty += 10;
          isRisky = true;
        } else if (data.irritationPotential === 'moderate') {
          penalty += 5;
        }
      }

      // Bonuses
      const beneficialRoles = ['humectant', 'barrier repair', 'ceramide', 'peptide'];
      const beneficialNames = ['glycerin', 'hyaluronic acid', 'squalane', 'niacinamide'];
      const roleLower = role.toLowerCase();
      
      if (beneficialRoles.some(r => roleLower.includes(r)) || beneficialNames.includes(name)) {
         bonus += 5;
      } else if (data.goodFor && data.goodFor.includes(skinType)) {
         bonus += 3;
      }

      if (isRisky || penalty >= 10 || risk === 'high') {
        riskyList.push(formattedName);
      } else {
        safeList.push(formattedName);
      }

      processedIngredients.push({
        name: formattedName,
        benefit,
        risk
      });

    } else {
      if (avoidList.includes(name)) {
        penalty += 20;
        isRisky = true;
        strongIrritantCount++;
        warnings.push({ ingredient: rawName, message: `Contains ${rawName} which is on your avoid list.` });
      }

      if (isRisky) {
        riskyList.push(rawName);
      } else {
        safeList.push(rawName);
      }

      processedIngredients.push({
        name: rawName,
        benefit,
        risk
      });
    }

    score = score - penalty + bonus;
  });

  // Strict Limits clamping
  score = Math.max(0, Math.min(100, Math.round(score)));

  let verdict = 'Excellent';
  if (score < 40) verdict = 'Harmful';
  else if (score < 55) verdict = 'Risky';
  else if (score < 70) verdict = 'Mixed';
  else if (score < 85) verdict = 'Good';

  // Override Rule
  if (strongIrritantCount >= 2 && score >= 40) {
    verdict = 'Risky';
  }

  return {
    score,
    verdict,
    ingredients: processedIngredients,
    warnings,
    conflicts,
    safe: safeList,
    risky: riskyList
  };
};
