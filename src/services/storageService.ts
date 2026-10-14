import { CivicIssue, IssueStatus, IssuePriority } from '../types/issue';
import { INITIAL_DEMO_ISSUES } from '../data/demoData';

const STORAGE_KEY = 'civicpulse_issues_v1';

export function getStoredIssues(): CivicIssue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First time launch: initialize with realistic demo dataset
      saveStoredIssues(INITIAL_DEMO_ISSUES);
      return INITIAL_DEMO_ISSUES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DEMO_ISSUES;
  } catch (err) {
    console.error('Failed to parse issues from localStorage:', err);
    return INITIAL_DEMO_ISSUES;
  }
}

export function saveStoredIssues(issues: CivicIssue[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    // Dispatch a custom window event so all components react immediately
    window.dispatchEvent(new Event('civicpulse_storage_updated'));
  } catch (err) {
    console.error('Failed to save issues to localStorage:', err);
  }
}

export function addIssue(
  data: Omit<CivicIssue, 'id' | 'createdAt' | 'updatedAt' | 'upvotes'>
): CivicIssue {
  const issues = getStoredIssues();
  const newId = `CP-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newIssue: CivicIssue = {
    ...data,
    id: newId,
    createdAt: now,
    updatedAt: now,
    upvotes: 1,
    statusHistory: [
      {
        status: data.status,
        timestamp: now,
        note: 'Report submitted by citizen and queued for municipal dispatch.'
      }
    ]
  };

  const updatedList = [newIssue, ...issues];
  saveStoredIssues(updatedList);
  return newIssue;
}

export function updateIssueStatus(
  id: string,
  newStatus: IssueStatus,
  note?: string
): CivicIssue | null {
  const issues = getStoredIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = issues[index];

  const history = current.statusHistory || [];
  history.push({
    status: newStatus,
    timestamp: now,
    note: note || `Status updated to ${newStatus}`
  });

  const updated: CivicIssue = {
    ...current,
    status: newStatus,
    updatedAt: now,
    resolvedAt: newStatus === 'Resolved' ? (current.resolvedAt || now) : undefined,
    statusHistory: history
  };

  issues[index] = updated;
  saveStoredIssues(issues);
  return updated;
}

export function updateIssuePriority(
  id: string,
  newPriority: IssuePriority,
  reason: string
): CivicIssue | null {
  const issues = getStoredIssues();
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const current = issues[index];

  const updated: CivicIssue = {
    ...current,
    priority: newPriority,
    priorityOverrideReason: reason,
    updatedAt: now
  };

  issues[index] = updated;
  saveStoredIssues(issues);
  return updated;
}

export function deleteIssue(id: string): boolean {
  const issues = getStoredIssues();
  const filtered = issues.filter((i) => i.id !== id);
  if (filtered.length !== issues.length) {
    saveStoredIssues(filtered);
    return true;
  }
  return false;
}

export function upvoteIssue(id: string): number {
  const issues = getStoredIssues();
  const target = issues.find((i) => i.id === id);
  if (target) {
    target.upvotes = (target.upvotes || 0) + 1;
    saveStoredIssues(issues);
    return target.upvotes;
  }
  return 0;
}

export function resetToDemoData(): CivicIssue[] {
  saveStoredIssues(INITIAL_DEMO_ISSUES);
  return INITIAL_DEMO_ISSUES;
}

export function exportIssuesAsJSON(): void {
  const issues = getStoredIssues();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(issues, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `civicpulse_issues_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
