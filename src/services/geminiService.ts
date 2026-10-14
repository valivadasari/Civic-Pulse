import { AIAnalysisResult, IssueCategory, IssuePriority } from '../types/issue';

const STORAGE_KEY_GEMINI = 'civicpulse_gemini_api_key';

/**
 * Retrieves the Gemini API key from environment variable or user localStorage setting
 */
export function getGeminiApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
    return envKey.trim();
  }
  const storedKey = localStorage.getItem(STORAGE_KEY_GEMINI);
  return storedKey ? storedKey.trim() : '';
}

/**
 * Saves a user-supplied Gemini API key
 */
export function saveGeminiApiKey(key: string): void {
  if (!key.trim()) {
    localStorage.removeItem(STORAGE_KEY_GEMINI);
  } else {
    localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
  }
}

/**
 * Converts a File or image URL to base64
 */
export async function imageToBase64(fileOrUrl: File | string): Promise<{ base64Data: string; mimeType: string }> {
  if (typeof fileOrUrl === 'string') {
    // If it's already a data URL
    if (fileOrUrl.startsWith('data:')) {
      const parts = fileOrUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      return { base64Data: parts[1], mimeType: mime };
    }
    // Fetch image url and convert to base64
    try {
      const resp = await fetch(fileOrUrl, { mode: 'cors' });
      const blob = await resp.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          const parts = res.split(',');
          resolve({
            base64Data: parts[1],
            mimeType: blob.type || 'image/jpeg'
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      // Fallback if CORS prevents fetching remote image
      return { base64Data: '', mimeType: 'image/jpeg' };
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      const parts = res.split(',');
      resolve({
        base64Data: parts[1],
        mimeType: fileOrUrl.type || 'image/jpeg'
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileOrUrl);
  });
}

/**
 * Calls real Gemini API with multimodal vision + text input
 */
export async function analyzeIssueWithGemini(
  imageSource: File | string | null,
  description: string,
  selectedCategory?: IssueCategory
): Promise<AIAnalysisResult> {
  const apiKey = getGeminiApiKey();

  // If no API key is available, return transparently labeled demo simulation
  if (!apiKey) {
    return generateSimulatedAnalysis(description, selectedCategory);
  }

  try {
    let base64Image = '';
    let mimeType = 'image/jpeg';

    if (imageSource) {
      const imgObj = await imageToBase64(imageSource);
      base64Image = imgObj.base64Data;
      mimeType = imgObj.mimeType;
    }

    const promptText = `
You are an expert municipal infrastructure inspector for CivicPulse AI.
Analyze the provided civic issue report (photo and description).

User Description: "${description || 'No description provided'}"
Selected Category by User: "${selectedCategory || 'Unspecified'}"

Output a STRICT JSON object with these EXACT keys:
{
  "likelyCategory": "Pothole" | "Garbage" | "Blocked Drain" | "Water Leakage" | "Other",
  "summary": "1 concise sentence describing the hazard and severity",
  "recommendedPriority": "High" | "Medium" | "Low",
  "reasoning": "2-3 sentences explaining physical factors, public safety risk, pedestrian/traffic impact, and why this priority is recommended",
  "nextAction": "1 clear municipal dispatch recommendation or immediate mitigation step",
  "confidence": float between 0.70 and 0.99,
  "hazardScore": integer between 1 and 10,
  "detectedFeatures": ["feature 1", "feature 2", "feature 3"]
}

Prioritization Rules:
- "High": Immediate danger to human life/safety, severe road cavities (>2.5 inches deep), water main break with flooding risk, blocked drain causing road inundation, hazardous materials.
- "Medium": Moderate disruption, overflowing garbage obstructing sidewalks, clogged catch basin before rain, damaged pedestrian infrastructure.
- "Low": Minor surface blemishes, cosmetic litter, slow nuisance water drip, low-traffic path wear.

Output ONLY valid raw JSON without markdown code fences or backticks.
`;

    // Try Gemini 2.5 Flash / 1.5 Flash models
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: promptText }];
    if (base64Image && base64Image.length > 50) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Image
        }
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 800,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.warn('Gemini API request failed with status:', response.status, errBody);
      throw new Error(`Gemini API error (${response.status}): ${errBody.slice(0, 150)}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('No response text received from Gemini API');
    }

    // Clean JSON response if enclosed in markdown fences
    let cleanJson = candidateText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson);

    // Validate and sanitize values
    const validCategories: IssueCategory[] = ['Pothole', 'Garbage', 'Blocked Drain', 'Water Leakage', 'Other'];
    const validPriorities: IssuePriority[] = ['Low', 'Medium', 'High'];

    const likelyCategory = validCategories.includes(parsed.likelyCategory)
      ? (parsed.likelyCategory as IssueCategory)
      : (selectedCategory || 'Other');

    const recommendedPriority = validPriorities.includes(parsed.recommendedPriority)
      ? (parsed.recommendedPriority as IssuePriority)
      : 'Medium';

    return {
      likelyCategory,
      summary: parsed.summary || 'Civic infrastructure anomaly detected and categorized.',
      recommendedPriority,
      reasoning: parsed.reasoning || 'Identified based on multi-modal vision cues and spatial hazard assessment.',
      nextAction: parsed.nextAction || 'Schedule field inspection by municipal department.',
      confidence: typeof parsed.confidence === 'number' ? Math.min(0.99, Math.max(0.6, parsed.confidence)) : 0.91,
      hazardScore: typeof parsed.hazardScore === 'number' ? Math.min(10, Math.max(1, parsed.hazardScore)) : 6,
      isSimulated: false, // Genuine Google Gemini output!
      analyzedAt: new Date().toISOString(),
      detectedFeatures: Array.isArray(parsed.detectedFeatures) ? parsed.detectedFeatures.slice(0, 5) : []
    };
  } catch (error: any) {
    console.error('Error invoking Gemini Vision API:', error);
    // Return gracefully labeled fallback with clear error explanation
    const fallback = generateSimulatedAnalysis(description, selectedCategory);
    fallback.reasoning = `[API Note: Gemini call failed (${error.message || 'Network error'}). Using fallback model]: ${fallback.reasoning}`;
    return fallback;
  }
}

/**
 * High-fidelity fallback heuristic simulation when no API key is provided
 * Strictly sets isSimulated: true to maintain full transparency and ethical AI compliance
 */
export function generateSimulatedAnalysis(
  description: string,
  selectedCategory?: IssueCategory
): AIAnalysisResult {
  const text = (description || '').toLowerCase();

  let category: IssueCategory = selectedCategory || 'Other';
  let priority: IssuePriority = 'Medium';
  let hazardScore = 6;
  let features: string[] = [];
  let summary = '';
  let reasoning = '';
  let nextAction = '';

  // Smart heuristic detection based on keywords
  if (text.includes('pothole') || text.includes('crater') || text.includes('asphalt') || text.includes('tire') || text.includes('rim') || category === 'Pothole') {
    category = 'Pothole';
    if (text.includes('deep') || text.includes('severe') || text.includes('tire') || text.includes('swerve') || text.includes('danger')) {
      priority = 'High';
      hazardScore = 8;
      summary = 'Severe road surface degradation with elevated vehicular accident hazard.';
      reasoning = 'Cavitation exceeds standard depth tolerances on active vehicular lane. Poses immediate risk of blown tires, suspension structural failure, and erratic evasive steering.';
      nextAction = 'Dispatch rapid asphalt patching crew; deploy temporary reflective hazard bollards.';
      features = ['asphalt surface fracture', 'cavity depth > 3 inches', 'vehicular lane encroachment'];
    } else {
      priority = 'Medium';
      hazardScore = 5;
      summary = 'Roadway surface depression requiring preventive maintenance.';
      reasoning = 'Moderate asphalt wear detected. Sub-base intact but moisture ingress will accelerate deterioration under seasonal rainfall.';
      nextAction = 'Log for weekly scheduled municipal street resurfacing route.';
      features = ['surface spalling', 'aggregate loosening'];
    }
  } else if (text.includes('garbage') || text.includes('trash') || text.includes('dump') || text.includes('refuse') || text.includes('waste') || category === 'Garbage') {
    category = 'Garbage';
    if (text.includes('bio') || text.includes('rodent') || text.includes('spill') || text.includes('sidewalk') || text.includes('massive')) {
      priority = 'Medium';
      hazardScore = 6;
      summary = 'Accumulated municipal solid waste obstructing public passage.';
      reasoning = 'Waste container overflow overflowing onto pedestrian sidewalk corridor. Poses sanitary nuisance and potential vector attraction.';
      nextAction = 'Issue public works bulk refuse pickup order and notify zone sanitation inspector.';
      features = ['overflowing containment', 'corridor obstruction', 'organic refuse'];
    } else {
      priority = 'Low';
      hazardScore = 4;
      summary = 'Minor litter concentration in public recreation or residential sector.';
      reasoning = 'Localized dry solid waste. No hazardous substances or direct pedestrian blockage observed.';
      nextAction = 'Assign to routine street cleaning sweep route.';
      features = ['scattered debris', 'recyclable packaging'];
    }
  } else if (text.includes('drain') || text.includes('flood') || text.includes('water standing') || text.includes('clog') || category === 'Blocked Drain') {
    category = 'Blocked Drain';
    priority = 'High';
    hazardScore = 8;
    summary = 'Storm drain intake blockage causing localized street surface water retention.';
    reasoning = 'Accumulated leaves and silt prevent surface water absorption. Surface pooling creates hydroplaning danger and potential perimeter basement seepage.';
    nextAction = 'Deploy hydro-vacuum clearing truck to clear inlet grate and flush lateral storm conduit.';
    features = ['inlet grate compaction', 'standing pooled water', 'vegetative silt buildup'];
  } else if (text.includes('leak') || text.includes('pipe') || text.includes('burst') || text.includes('spray') || text.includes('gush') || category === 'Water Leakage') {
    category = 'Water Leakage';
    priority = 'High';
    hazardScore = 9;
    summary = 'Pressurized potable water conveyance breach with continuous volume loss.';
    reasoning = 'Active water ejection indicates line failure under pressure. High risk of sub-surface soil voiding and potential foundation settlement if unaddressed.';
    nextAction = 'Emergency notification to Water Board for immediate shutoff valve isolation and clamp placement.';
    features = ['pressurized water breach', 'pavement saturated', 'continuous runoff stream'];
  } else {
    category = selectedCategory || 'Other';
    priority = 'Medium';
    hazardScore = 5;
    summary = 'Civic infrastructure anomaly logged for municipal classification.';
    reasoning = 'General public space condition requiring standard engineering inspection and inventory assessment.';
    nextAction = 'Assign municipal field officer for on-site diagnostic review.';
    features = ['infrastructure irregularity', 'urban environment impact'];
  }

  return {
    likelyCategory: category,
    summary,
    recommendedPriority: priority,
    reasoning,
    nextAction,
    confidence: 0.88,
    hazardScore,
    isSimulated: true, // Transparently marks this as simulated!
    analyzedAt: new Date().toISOString(),
    detectedFeatures: features
  };
}
