'use client';

import { AnalysisHistoryLog, AnalysisType } from '@/types/history';
import { generateUUID } from '@/lib/app/uuid';

const HISTORY_STORAGE_KEY = 'secret_paws_analysis_history';
const ANALYSIS_TYPES: AnalysisType[] = ['SAJU', 'DREAM', 'PALMISTRY', 'NAMING', 'ASTROLOGY', 'TAROT', 'TOJEONG'];

function parseStoredLogs(raw: string): unknown[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isValidAnalysisType(value: unknown): value is AnalysisType {
  return typeof value === 'string' && ANALYSIS_TYPES.includes(value as AnalysisType);
}

function isHistoryLog(value: unknown): value is AnalysisHistoryLog {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<AnalysisHistoryLog>;
  return (
    typeof candidate.id === 'string' &&
    isValidAnalysisType(candidate.type) &&
    typeof candidate.title === 'string' &&
    typeof candidate.subtitle === 'string' &&
    typeof candidate.timestamp === 'number' &&
    candidate.result !== undefined
  );
}

/**
 * Get all analysis history logs from localStorage
 */
export function getAnalysisHistory(): AnalysisHistoryLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (!stored) return [];

  const parsed = parseStoredLogs(stored);
  const valid = parsed.filter(isHistoryLog);

  if (valid.length !== parsed.length) {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(valid));
  }

  return valid;
}

export function getAnalysisHistoryById(id: string): AnalysisHistoryLog | undefined {
  if (typeof window === 'undefined') return undefined;
  return getAnalysisHistory().find((log) => log.id === id);
}

export function saveAnalysisToHistory(
  log: Omit<AnalysisHistoryLog, 'id' | 'timestamp'>,
  options?: {
    resultUrlFactory?: (id: string) => string;
  }
): AnalysisHistoryLog | undefined {
  if (typeof window === 'undefined') return;

  const logs = getAnalysisHistory();
  const id = generateUUID();
  const newLog: AnalysisHistoryLog = {
    ...log,
    id,
    timestamp: Date.now(),
  };

  if (options?.resultUrlFactory) {
    newLog.resultUrl = options.resultUrlFactory(id);
  }

  const updated = [newLog, ...logs];
  const limited = updated.slice(0, 50);
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(limited));
  } catch {
    return;
  }
  return newLog;
}

/**
 * Save an analysis log to the history
 */
/**
 * Delete a specific log from history
 */
export function deleteAnalysisFromHistory(id: string) {
  if (typeof window === 'undefined') return;

  const logs = getAnalysisHistory();
  const updated = logs.filter((log) => log.id !== id);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Clear all history
 */
export function clearAnalysisHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}

/**
 * Get display icon and color based on analysis type
 */
export function getAnalysisTypeInfo(type: AnalysisType): { icon: string; color: string; label: string } {
  switch (type) {
    case 'SAJU':
      return { icon: '🕯', color: 'text-cyan-400', label: '사주' };
    case 'DREAM':
      return { icon: '🌙', color: 'text-indigo-400', label: '꿈' };
    case 'PALMISTRY':
      return { icon: '🖐', color: 'text-emerald-400', label: '관상' };
    case 'NAMING':
      return { icon: '🧬', color: 'text-rose-400', label: '작명' };
    case 'ASTROLOGY':
      return { icon: '♈', color: 'text-purple-400', label: '점성술' };
    case 'TAROT':
      return { icon: '🃏', color: 'text-amber-400', label: '타로' };
    case 'TOJEONG':
      return { icon: '📜', color: 'text-emerald-400', label: '토정' };
    default:
      return { icon: '📜', color: 'text-slate-400', label: '분석' };
  }
}
