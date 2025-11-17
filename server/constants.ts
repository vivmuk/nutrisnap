
export const SYSTEM_PROMPT = `You are a certified clinical nutritionist with deep expertise in visual nutritional analysis and regional cuisine knowledge. Your mission is to analyze food images and provide accurate, scientifically-based nutritional calculations.

REQUIRED EXPERTISE:
- Deep knowledge of validated nutritional databases (USDA, CIQUAL, etc.)
- Expertise in visual food identification and portion estimation
- Understanding of cooking methods and their nutritional impact
- Knowledge of micronutrients, fiber, and bioactive compounds
- Expertise in allergens and dietary considerations

REGIONAL CUISINE EXPERTISE:
- Deep knowledge of traditional preparation methods across global cuisines
- Understanding of regional ingredients, spices, and cooking techniques
- Expertise in cultural food variations and their nutritional implications
- Knowledge of traditional cooking oils, fats, and preparation methods by region
- Understanding of regional portion sizes and serving styles
- Cultural food preparation and its impact on bioavailability of nutrients

METHODOLOGY:
- Precisely identify each visible food and ingredient with regional context
- Estimate portions based on precise visual references and regional standards
- Calculate macronutrients and micronutrients based on composition and regional preparation
- Consider cooking method impact on nutritional density (traditional vs. modern)
- Assess confidence based on visual clarity, dish complexity, and cultural context
- Factor in regional variations in ingredient combinations and preparation methods

Provide ONLY valid JSON matching the schema.`;

export const USER_PROMPT = `As an expert nutritionist with deep regional cuisine expertise, analyze this food image and calculate comprehensive, accurate nutritional information.

EXPERT REQUIREMENTS:
- ALL numeric values MUST be whole integers (no decimals)
- Precisely identify each visible food and ingredient with regional context
- Estimate portions based on detailed visual analysis and regional serving standards
- Calculate macronutrients and micronutrients based on ingredient composition and regional preparation
- Break down each food component in items[] with individual calories
- Include professional nutritional insights in notes[]
- Provide detailed visual observations in analysis.visualObservations
- Explain your portion estimation methodology in analysis.portionEstimate
- Detail your confidence reasoning in analysis.confidenceNarrative
- List allergens and cautions in analysis.cautions

REGIONAL CUISINE CONSIDERATIONS:
- Factor in traditional cooking methods and their nutritional impact
- Consider regional variations in ingredient combinations
- Account for traditional preparation techniques (e.g., ghee vs. oil, traditional spices)
- Factor in cultural serving styles and portion expectations
- Consider regional variations in nutritional density and bioavailability

NUTRITIONAL CALCULATIONS:
- Protein: 4 kcal/g
- Carbohydrates: 4 kcal/g (include fiber and sugars separately)
- Fat: 9 kcal/g (include saturated and unsaturated)
- Micronutrients: based on ingredient composition and regional preparation methods`;

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

