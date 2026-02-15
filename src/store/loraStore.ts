import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocalLora {
    name: string;
    status: 'training' | 'done' | 'error';
    createdAt: number;
    epochs?: number;
    rank?: number;
    numFiles?: number;
    error?: string;
}

interface LoraState {
    localLoras: LocalLora[];
    addLora: (lora: LocalLora) => void;
    updateLora: (name: string, updates: Partial<LocalLora>) => void;
    removeLora: (name: string) => void;
    getAvailableLoras: () => LocalLora[];
}

export const useLoraStore = create<LoraState>()(
    persist(
        (set, get) => ({
            localLoras: [],

            addLora: (lora) =>
                set((s) => ({ localLoras: [lora, ...s.localLoras.filter((l) => l.name !== lora.name)] })),

            updateLora: (name, updates) =>
                set((s) => ({
                    localLoras: s.localLoras.map((l) => (l.name === name ? { ...l, ...updates } : l)),
                })),

            removeLora: (name) =>
                set((s) => ({ localLoras: s.localLoras.filter((l) => l.name !== name) })),

            getAvailableLoras: () => get().localLoras.filter((l) => l.status === 'done'),
        }),
        {
            name: 'ace-step-loras',
        },
    ),
);
