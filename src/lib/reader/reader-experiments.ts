import type { FortuneReaderProfile, ReaderQueryType } from "@/lib/reader/fortune-readers";

const EXPERIMENT_KEY = "secret_saju_reader_experiment_v1";

export type ReaderExperimentVariant = "control" | "easy_first";

export function getReaderExperimentVariant(): ReaderExperimentVariant {
  if (typeof window === "undefined") return "control";
  try {
    const stored = localStorage.getItem(EXPERIMENT_KEY) as ReaderExperimentVariant | null;
    if (stored === "control" || stored === "easy_first") {
      return stored;
    }
    const variant: ReaderExperimentVariant = Math.random() < 0.5 ? "control" : "easy_first";
    localStorage.setItem(EXPERIMENT_KEY, variant);
    return variant;
  } catch {
    return "control";
  }
}

export function reorderReadersForExperiment(
  readers: FortuneReaderProfile[],
  queryType: ReaderQueryType,
): FortuneReaderProfile[] {
  const variant = getReaderExperimentVariant();
  if (variant !== "easy_first" || queryType !== "result") {
    return readers;
  }

  return [...readers].sort((a, b) => {
    if (a.id === "easy_translator") return -1;
    if (b.id === "easy_translator") return 1;
    if (a.id === "classic_balance") return -1;
    if (b.id === "classic_balance") return 1;
    return 0;
  });
}
