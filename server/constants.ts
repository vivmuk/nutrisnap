
export const SYSTEM_PROMPT = `You are a world-renowned Clinical Nutritionist and Food Scientist with 20+ years of experience in precision nutritional analysis. You combine expertise from multiple disciplines to provide the most accurate food analysis possible.

CORE COMPETENCIES:
- **Food Science Mastery**: Deep understanding of ingredient chemistry, cooking transformations (Maillard reaction, caramelization, protein denaturation), nutrient bioavailability changes during cooking, and precise density/volume relationships for all food states.
- **Clinical Nutrition Excellence**: Expert-level knowledge of USDA FoodData Central, CIQUAL, McCance & Widdowson databases. Understanding of metabolic pathways, glycemic index/load, and nutrient interactions.
- **Advanced Visual Analysis**: Professional training in portion estimation using:
  * Comparative sizing (hand measurements, standard objects)
  * Depth perception and 3D volume calculation
  * Plate/bowl size standardization (6", 8", 10", 12" diameters)
  * Food density recognition (fluffy vs. compact, cooked vs. raw states)
- **Global Cuisine Expertise**: Comprehensive knowledge of regional cooking methods, traditional ingredients, hidden components (ghee, coconut oil, palm oil, lard), and cultural portion norms across Asian, European, African, Latin American, and Middle Eastern cuisines.

PRECISION MEASUREMENT PROTOCOL:
1. **Visual Assessment** (30 seconds):
   - Identify plate/bowl size using visual cues (rim thickness, depth, comparative objects)
   - Assess food height, spread, and density
   - Note cooking method indicators (browning, moisture, texture)
   
2. **Ingredient Identification** (45 seconds):
   - List ALL visible ingredients with specificity (e.g., "basmati rice" not "rice")
   - Infer hidden ingredients based on dish type, regional origin, and visual cues:
     * Fried foods: absorbed oil (10-20% weight increase)
     * Curries: cream, coconut milk, or yogurt base
     * Baked goods: butter, eggs, sugar ratios
     * Sauces: thickeners, sugars, fats
   
3. **Quantity Estimation** (60 seconds):
   - Use user cues as PRIMARY measurement anchors
   - Apply standard portion references:
     * Fist = ~1 cup (240ml)
     * Palm = ~3oz (85g) protein
     * Thumb = ~1 tbsp (15ml)
     * Cupped hand = ~1-2oz (30-60g) nuts/chips
   - Calculate volume using geometric approximations
   - Convert to weight using food-specific densities:
     * Cooked rice: 195g/cup
     * Raw vegetables: 70-100g/cup
     * Cooked meat: 140g/cup
     * Liquids: 240ml/cup
   
4. **Nutritional Calculation** (90 seconds):
   - Use ingredient-specific nutritional profiles
   - Account for cooking method impacts:
     * Frying: +40-120 kcal per serving (oil absorption)
     * Grilling: -5-10% weight (moisture loss)
     * Steaming: minimal nutrient loss
     * Baking: +butter/oil as specified in recipe
   - Calculate macros with precision:
     * Protein: 4 kcal/g
     * Carbs: 4 kcal/g (separate fiber, sugars, starch)
     * Fat: 9 kcal/g (separate saturated, monounsaturated, polyunsaturated)
   - Include micronutrients based on ingredient composition
   
5. **Validation & Confidence** (30 seconds):
   - Cross-reference total calories with validated database entries
   - Assess confidence based on image clarity, portion visibility, and ingredient certainty
   - Flag any assumptions made

ACCURACY STANDARDS:
- Aim for ±10% accuracy on total calories
- ±5g accuracy on macronutrients
- Provide confidence score (0-100) with detailed reasoning
- List all assumptions and uncertainty factors

Provide ONLY valid JSON matching the schema.`;

export const USER_PROMPT = `Analyze this food image with expert-level precision.

USER-PROVIDED MEASUREMENT CUES:
{{USER_CUES}}

ANALYSIS REQUIREMENTS:
1. **Precise Identification**: 
   - Identify the specific dish name and regional variation
   - List every visible ingredient with specificity (e.g., "jasmine rice" not "white rice")
   - Infer hidden ingredients based on cooking method and dish type
   - Note any garnishes, sauces, or condiments

2. **Accurate Quantity Assessment**:
   - PRIORITIZE user cues as ground truth for measurements
   - Use visual reference points (plate size, utensils, hand comparisons)
   - Estimate volume in cups/ml, then convert to grams using food-specific densities
   - Account for food state (raw vs cooked, compressed vs fluffy)
   - Consider portion overlap and depth perception

3. **Detailed Nutritional Calculation**:
   - Calculate macronutrients for EACH food item separately
   - Account for cooking method impacts (oil absorption, moisture loss)
   - Include detailed carbohydrate breakdown (fiber, sugars, net carbs)
   - Specify fat types (saturated, monounsaturated, polyunsaturated)
   - Estimate key micronutrients (vitamins A, C, D, E, K, B-complex, calcium, iron, magnesium, potassium, zinc)

4. **Professional Assessment**:
   - Provide confidence score (0-100) with detailed reasoning
   - Explain portion estimation methodology
   - List potential allergens and dietary cautions
   - Include nutritional insights and health considerations

5. **Quality Assurance**:
   - Verify total calories align with individual item calories
   - Cross-check against standard portion sizes
   - Flag any assumptions or uncertainties

OUTPUT FORMAT: Provide response as valid JSON matching the exact schema structure.`;

// JSON Schema format for Venice API
export const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    dishName: { 
      type: "string", 
      description: "A concise, descriptive name for the dish shown in the image." 
    },
    totalCalories: { 
      type: "integer", 
      description: "The total estimated calories for the entire meal, as an integer." 
    },
    macroNutrients: {
      type: "object",
      properties: {
        protein: { 
          type: "integer", 
          description: "Total protein in grams." 
        },
        carbohydrates: {
          type: "object",
          properties: {
            total: { 
              type: "integer", 
              description: "Total carbohydrates in grams." 
            },
            fiber: { 
              type: "integer", 
              description: "Dietary fiber in grams." 
            },
            sugars: { 
              type: "integer", 
              description: "Total sugars in grams." 
            },
          },
          required: ["total", "fiber", "sugars"],
        },
        fat: {
          type: "object",
          properties: {
            total: { 
              type: "integer", 
              description: "Total fat in grams." 
            },
            saturated: { 
              type: "integer", 
              description: "Saturated fat in grams." 
            },
            unsaturated: { 
              type: "integer", 
              description: "Unsaturated fat in grams." 
            },
          },
          required: ["total", "saturated", "unsaturated"],
        },
      },
      required: ["protein", "carbohydrates", "fat"],
    },
    microNutrients: {
      type: "object",
      properties: {
        vitamins: { 
          type: "string", 
          description: "A summary of key vitamins present in the meal." 
        },
        minerals: { 
          type: "string", 
          description: "A summary of key minerals present in the meal." 
        },
      },
      required: ["vitamins", "minerals"],
    },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { 
            type: "string", 
            description: "Name of the individual food item." 
          },
          calories: { 
            type: "integer", 
            description: "Estimated calories for this item." 
          },
          weightGrams: { 
            type: "integer", 
            description: "Estimated weight in grams for this item." 
          },
          macronutrients: {
            type: "object",
            properties: {
              protein: { type: "integer" },
              carbohydrates: {
                type: "object",
                properties: { 
                  total: { type: "integer" }, 
                  fiber: { type: "integer" }, 
                  sugars: { type: "integer" }
                },
                required: ["total", "fiber", "sugars"],
              },
              fat: {
                type: "object",
                properties: { 
                  total: { type: "integer" }, 
                  saturated: { type: "integer" }, 
                  unsaturated: { type: "integer" }
                },
                required: ["total", "saturated", "unsaturated"],
              },
            },
            required: ["protein", "carbohydrates", "fat"],
          }
        },
        required: ["name", "calories", "weightGrams", "macronutrients"],
      },
    },
    notes: {
      type: "array",
      items: { type: "string" },
      description: "An array of professional nutritional insights, tips, or comments about the meal."
    },
    analysis: {
      type: "object",
      properties: {
        visualObservations: { 
          type: "string", 
          description: "Detailed visual observations about the food's appearance, cooking method, etc." 
        },
        portionEstimate: { 
          type: "string", 
          description: "Explanation of the methodology used for portion size estimation." 
        },
        confidence: { 
          type: "integer", 
          description: "Confidence score (0-100) in the accuracy of the analysis." 
        },
        confidenceNarrative: { 
          type: "string", 
          description: "A narrative explaining the reasoning behind the confidence score." 
        },
        cautions: {
          type: "array",
          items: { type: "string" },
          description: "A list of potential allergens or dietary cautions."
        },
      },
      required: ["visualObservations", "portionEstimate", "confidence", "confidenceNarrative", "cautions"],
    },
  },
  required: ["dishName", "totalCalories", "macroNutrients", "microNutrients", "items", "notes", "analysis"],
};
