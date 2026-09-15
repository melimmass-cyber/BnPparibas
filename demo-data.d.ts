export interface DemoAsset { id: string; name: string; category: string; quantity: number | null; unit: string; value: number; currency: string; approximate: boolean; }
export const assets: readonly DemoAsset[];
export const usdTotal: number;
export const deposit: Readonly<{ value: number; available: number; currency: string }>;
export function money(value: number, currency?: string): string;
export function createDemoCsv(kind?: string): string;
