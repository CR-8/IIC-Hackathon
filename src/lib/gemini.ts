import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GeminiAnalysis {
  uiType: string;
  designSystem: string;
  strengths: string[];
  weaknesses: string[];
  accessibilityIssues: string[];
  recommendations: string[];
  colorSchemeAnalysis: string;
  layoutAnalysis: string;
  typographyAnalysis: string;
  userExperience: string;
  targetAudienceMatch: string;
  overallQuality: number;
  contrastScore: number;
  wcagComplianceScore: number;
  colorPalette: {
    primary: string[];
    secondary: string[];
    accent: string[];
    text: string[];
    background: string[];
  };
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error as Error;

      if (i < maxRetries - 1) {
        const waitTime = initialDelay * Math.pow(2, i);
        console.log(
          `Error occurred. Retry ${i + 1}/${maxRetries} after ${waitTime}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      throw error;
    }
  }

  throw lastError!;
}

/**
 * Clean and extract JSON from text response
 */
function extractJSON(text: string): string {
  // Check if text is empty or invalid
  if (!text || text.trim().length === 0) {
    console.error("JSON extraction failed: Empty response from API");
    throw new Error("Empty response from Gemini API");
  }

  // Remove markdown code blocks
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "");

  // Try to find JSON object or array
  const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error(
      "JSON extraction failed. Response text:",
      text.substring(0, 500)
    );
    throw new Error("No valid JSON found in response");
  }

  const jsonStr = jsonMatch[0].trim();

  // Sanitize JSON to escape control characters in strings
  const sanitized = sanitizeJSON(jsonStr);

  // Validate it's parseable
  try {
    JSON.parse(sanitized);
    return sanitized;
  } catch (e) {
    console.error("JSON parse validation failed:", e);
    throw new Error(`Invalid JSON structure: ${e}`);
  }
}

/**
 * Sanitize JSON string by escaping control characters in string literals
 */
function sanitizeJSON(jsonStr: string): string {
  // Replace unescaped control characters in strings with escaped versions
  return jsonStr.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
    return match.replace(/[\n\r\t]/g, (char) => {
      switch (char) {
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\t":
          return "\\t";
        default:
          return char;
      }
    });
  });
}

function validateAnalysis(data: Record<string, unknown>): GeminiAnalysis {
  const requiredFields = [
    "uiType",
    "designSystem",
    "strengths",
    "weaknesses",
    "accessibilityIssues",
    "recommendations",
    "colorSchemeAnalysis",
    "layoutAnalysis",
    "typographyAnalysis",
    "userExperience",
    "targetAudienceMatch",
    "overallQuality",
    "contrastScore",
    "wcagComplianceScore",
    "colorPalette",
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const arrayFields = [
    "strengths",
    "weaknesses",
    "accessibilityIssues",
    "recommendations",
  ];
  for (const field of arrayFields) {
    if (!Array.isArray(data[field])) {
      data[field] = [];
    }
  }

  if (
    typeof data.overallQuality !== "number" ||
    data.overallQuality < 0 ||
    data.overallQuality > 100
  ) {
    data.overallQuality = 50;
  }

  if (
    typeof data.contrastScore !== "number" ||
    data.contrastScore < 0 ||
    data.contrastScore > 100
  ) {
    data.contrastScore = 50;
  }

  if (
    typeof data.wcagComplianceScore !== "number" ||
    data.wcagComplianceScore < 0 ||
    data.wcagComplianceScore > 100
  ) {
    data.wcagComplianceScore = 50;
  }

  if (typeof data.colorPalette !== "object" || data.colorPalette === null) {
    data.colorPalette = {
      primary: [],
      secondary: [],
      accent: [],
      text: [],
      background: [],
    };
  }

  return data as unknown as GeminiAnalysis;
}

/**
 * Analyze UI image using Google Gemini Vision API with rate limiting
 */
export async function analyzeUIWithGemini(
  imageBuffer: Buffer
): Promise<GeminiAnalysis> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    });

    const prompt = `You are a UI/UX and accessibility expert. Analyze this UI screenshot and provide a comprehensive analysis in JSON format with the following structure:
{
  "uiType": "type of UI (e.g., Dashboard, Landing Page, Mobile App, etc.)",
  "designSystem": "identified design system (e.g., Material Design, iOS, Fluent, Custom)",
  "strengths": ["list of 3-5 strong points about the design"],
  "weaknesses": ["list of 3-5 areas that need improvement"],
  "accessibilityIssues": ["list of potential WCAG and accessibility concerns"],
  "recommendations": ["list of 5-7 specific actionable recommendations"],
  "colorSchemeAnalysis": "brief analysis of the color scheme effectiveness",
  "layoutAnalysis": "analysis of information hierarchy and layout structure",
  "typographyAnalysis": "analysis of font choices, sizes, and readability",
  "userExperience": "overall user experience assessment",
  "targetAudienceMatch": "who this UI is best suited for",
  "overallQuality": "score from 0-100 representing overall UI quality",
  "contrastScore": "score from 0-100 representing text-to-background contrast quality (100 = excellent contrast, 0 = poor contrast)",
  "wcagComplianceScore": "score from 0-100 representing WCAG 2.1 AA compliance level (100 = fully compliant, 0 = non-compliant)",
  "colorPalette": {
    "primary": ["#hexcolor1", "#hexcolor2"],
    "secondary": ["#hexcolor1"],
    "accent": ["#hexcolor1"],
    "text": ["#hexcolor1", "#hexcolor2"],
    "background": ["#hexcolor1"]
  }
}

Focus on:
- WCAG compliance issues
- Color contrast problems (calculate contrastScore based on text/background ratios)
- Typography and readability
- Layout and hierarchy
- Interactive elements visibility
- Mobile responsiveness indicators
- Visual consistency
- User flow clarity
- Extract exact hex color codes used in the UI for the colorPalette

Scoring guidelines:
- contrastScore: 80-100 (all text passes WCAG AA), 60-79 (mostly good), 40-59 (some issues), 0-39 (major issues)
- wcagComplianceScore: Consider text size, contrast ratios, touch targets, focus indicators, ARIA attributes
- overallQuality: Holistic assessment of design quality, usability, and aesthetics

Provide specific, actionable feedback. Return ONLY valid JSON, no markdown formatting.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    // Retry with exponential backoff
    const result = await retryWithBackoff(
      async () => {
        return await model.generateContent([prompt, imagePart]);
      },
      3,
      2000
    );

    const response = result.response;
    const text = response.text();
    // Check if response is valid
    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    const jsonString = extractJSON(text);
    const parsedData = JSON.parse(jsonString);
    const analysis = validateAnalysis(parsedData);

    console.log("Parsed Gemini analysis:", analysis);

    return analysis;
  } catch (error: unknown) {
    console.error("Gemini analysis error:", error);

    // Check if it's still a rate limit error after retries
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status: number }).status === 429
    ) {
      return {
        uiType: "Rate Limit Exceeded",
        designSystem: "Unable to analyze",
        strengths: ["Analysis temporarily unavailable due to API rate limits"],
        weaknesses: ["Please try again in a few minutes"],
        accessibilityIssues: [
          "API quota exceeded - unable to perform analysis",
        ],
        recommendations: [
          "Wait 60 seconds before analyzing another image",
          "Consider upgrading to Gemini API paid tier for higher limits",
          "Reduce analysis frequency",
          "Use batch processing with delays between requests",
          "Monitor usage at https://ai.dev/usage",
        ],
        colorSchemeAnalysis: "Rate limit exceeded - analysis unavailable",
        layoutAnalysis: "Rate limit exceeded - analysis unavailable",
        typographyAnalysis: "Rate limit exceeded - analysis unavailable",
        userExperience: "Rate limit exceeded - analysis unavailable",
        targetAudienceMatch: "Unable to determine due to rate limits",
        overallQuality: 0,
        contrastScore: 0,
        wcagComplianceScore: 0,
        colorPalette: {
          primary: [],
          secondary: [],
          accent: [],
          text: [],
          background: [],
        },
      };
    }

    // Generic fallback
    return {
      uiType: "Unknown",
      designSystem: "Custom",
      strengths: ["Modern appearance", "Functional layout"],
      weaknesses: ["AI analysis unavailable", "Manual review recommended"],
      accessibilityIssues: ["Unable to perform automated analysis"],
      recommendations: [
        "Perform manual accessibility audit",
        "Test with screen readers (NVDA, JAWS)",
        "Verify color contrast ratios manually",
        "Check keyboard navigation",
        "Validate WCAG 2.1 AA compliance",
      ],
      colorSchemeAnalysis: "Unable to analyze due to processing error",
      layoutAnalysis: "Unable to analyze due to processing error",
      typographyAnalysis: "Unable to analyze due to processing error",
      userExperience: "Unable to assess due to processing error",
      targetAudienceMatch: "General audience - manual evaluation needed",
      overallQuality: 50,
      contrastScore: 50,
      wcagComplianceScore: 50,
      colorPalette: {
        primary: [],
        secondary: [],
        accent: [],
        text: [],
        background: [],
      },
    };
  }
}

/**
 * Get design system recommendations with rate limiting
 */
export async function getDesignSystemRecommendations(
  imageBuffer: Buffer
): Promise<{ name: string; confidence: number; reasoning: string }[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const prompt = `Analyze this UI and identify design systems. Return ONLY JSON array:

[{"name": "system name", "confidence": 0-100, "reasoning": "why"}]

Consider: Material Design, iOS, Fluent, Tailwind, Ant Design, Bootstrap, Custom.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    const result = await retryWithBackoff(async () => {
      return await model.generateContent([prompt, imagePart]);
    });

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    const jsonString = extractJSON(text);
    const recommendations = JSON.parse(jsonString);

    if (!Array.isArray(recommendations)) {
      throw new Error("Response is not an array");
    }

    return recommendations;
  } catch (error) {
    console.error("Design system recommendation error:", error);
    return [
      {
        name: "Custom",
        confidence: 50,
        reasoning: "Unable to detect - rate limit or processing error",
      },
    ];
  }
}

/**
 * Extract text with rate limiting
 */
export async function extractTextWithGemini(imageBuffer: Buffer): Promise<{
  text: string;
  words: Array<{
    text: string;
    bbox: { x0: number; y0: number; x1: number; y1: number };
    confidence: number;
  }>;
}> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    });

    const prompt = `Extract all visible text from this UI screenshot. You MUST return ONLY a valid JSON object with this exact structure:

{
  "text": "concatenated string of all text found",
  "words": [
    {"text": "individual word or phrase", "estimatedSize": "16", "position": "top left"}
  ]
}

Rules:
- Return ONLY the JSON object, no explanations or markdown
- If no text is found, return {"text": "", "words": []}
- estimatedSize should be a number string (e.g., "14", "16", "20")
- position should combine vertical (top/middle/bottom) and horizontal (left/center/right)`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    const result = await retryWithBackoff(async () => {
      return await model.generateContent([prompt, imagePart]);
    });

    const response = result.response;
    const text = response.text();
    const jsonString = extractJSON(text);
    const data = JSON.parse(jsonString) as {
      text?: string;
      words?: Array<{ text: string; estimatedSize: string; position?: string }>;
    };

    const words = (data.words || []).map((word) => {
      const size = parseInt(word.estimatedSize) || 16;
      let baseX = 400,
        baseY = 400;

      if (word.position?.includes("left")) baseX = 100;
      if (word.position?.includes("right")) baseX = 700;
      if (word.position?.includes("top")) baseY = 100;
      if (word.position?.includes("bottom")) baseY = 700;

      return {
        text: word.text,
        bbox: {
          x0: baseX,
          y0: baseY,
          x1: baseX + word.text.length * size * 0.6,
          y1: baseY + size,
        },
        confidence: 85,
      };
    });

    return { text: data.text || "", words };
  } catch (error) {
    console.error("Gemini text extraction error:", error);
    return { text: "", words: [] };
  }
}

/**
 * Get accessibility recommendations with rate limiting
 */
export async function getAccessibilityRecommendations(
  imageBuffer: Buffer
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 3072,
      },
    });

    const prompt = `WCAG accessibility analysis. Return ONLY JSON array:

["recommendation 1", "recommendation 2", ...]

Focus: contrast ratios, 16px min text, 44px touch targets, focus indicators, ARIA labels, keyboard nav.`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/png",
      },
    };

    const result = await retryWithBackoff(async () => {
      return await model.generateContent([prompt, imagePart]);
    });

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    const jsonString = extractJSON(text);
    const recommendations = JSON.parse(jsonString);

    if (!Array.isArray(recommendations)) {
      throw new Error("Response is not an array");
    }

    return recommendations;
  } catch (error) {
    console.error("Accessibility recommendations error:", error);
    return [
      "Manual WCAG 2.1 AA audit required",
      "Test with screen readers",
      "Verify 44px touch targets",
      "Check 4.5:1 contrast ratios",
      "Test keyboard navigation",
    ];
  }
}
