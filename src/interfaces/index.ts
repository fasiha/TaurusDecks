export * as Tables from "./DbTablesV1";

export type FullRow<T> = {
  [k in keyof T]-?: NonNullable<T[k]>;
};
export type Selected<T> = FullRow<T> | undefined;
export type SelectedAll<T> = FullRow<T>[];

export const FINISHES = ["Normal", "Holo", "Reverse-holo", "Foil"] as const;
export const CONDITIONS = [
  "Near-mint",
  "Lightly played",
  "Moderately played",
  "Heavily played",
  "Damaged",
];

export type Finish = (typeof FINISHES)[number];
export type Condition = (typeof CONDITIONS)[number];

export function isFinish(x: string): x is Finish {
  return FINISHES.includes(x as any);
}

export function isCondition(x: string): x is Condition {
  return CONDITIONS.includes(x as any);
}
