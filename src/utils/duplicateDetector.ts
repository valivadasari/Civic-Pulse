import { CivicIssue, IssueCategory } from '../types/issue';

/**
 * Calculates distance in meters between two GPS coordinates using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Computes token-based Jaccard similarity between two text strings
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const tokenize = (str: string): Set<string> => {
    const words = str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2); // Ignore single/double character stop words
    return new Set(words);
  };

  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersectionCount = 0;
  tokens1.forEach((token) => {
    if (tokens2.has(token)) {
      intersectionCount++;
    }
  });

  const unionCount = new Set([...tokens1, ...tokens2]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

export interface DuplicateMatch {
  issue: CivicIssue;
  distanceMeters: number;
  textSimilarity: number;
  confidenceScore: number; // 0 to 1
  reason: string;
}

/**
 * Checks for existing issues that closely match the new report
 */
export function findPotentialDuplicates(
  newReport: {
    title: string;
    description: string;
    category: IssueCategory;
    lat: number;
    lng: number;
  },
  existingIssues: CivicIssue[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];

  // Consider open or in-progress issues primarily
  const activeIssues = existingIssues.filter((i) => i.status !== 'Resolved');

  for (const existing of activeIssues) {
    const distanceMeters = calculateHaversineDistance(
      newReport.lat,
      newReport.lng,
      existing.location.lat,
      existing.location.lng
    );

    const titleSim = calculateTextSimilarity(newReport.title, existing.title);
    const descSim = calculateTextSimilarity(newReport.description, existing.description);
    const combinedTextSim = Math.max(titleSim, (titleSim * 0.6 + descSim * 0.4));
    const isSameCategory = newReport.category === existing.category;

    // Proximity threshold: within 300 meters
    const isNearby = distanceMeters <= 300;

    let confidenceScore = 0;
    const reasons: string[] = [];

    if (isNearby && isSameCategory) {
      confidenceScore += 0.55;
      reasons.push(`${distanceMeters}m away with matching category "${newReport.category}"`);
    } else if (isNearby) {
      confidenceScore += 0.3;
      reasons.push(`Located only ${distanceMeters}m away`);
    }

    if (combinedTextSim > 0.25) {
      confidenceScore += combinedTextSim * 0.45;
      reasons.push(`${Math.round(combinedTextSim * 100)}% text similarity in report description`);
    }

    // Normalized to max 1.0
    confidenceScore = Math.min(1, Math.round(confidenceScore * 100) / 100);

    // If score passes threshold (>= 0.4)
    if (confidenceScore >= 0.4) {
      matches.push({
        issue: existing,
        distanceMeters,
        textSimilarity: combinedTextSim,
        confidenceScore,
        reason: reasons.join(' and ')
      });
    }
  }

  // Sort descending by highest confidence score
  return matches.sort((a, b) => b.confidenceScore - a.confidenceScore);
}
