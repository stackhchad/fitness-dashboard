import { create } from 'zustand';

interface Filters {
  search: string;
  from: string;
  to: string;
  workoutType: string;
  exercise: string;
}

interface WorkoutStore {
  filters: Filters;
  isFormOpen: boolean;
  editingId: string | null;
  setFilter: (key: keyof Filters, value: string) => void;
  resetFilters: () => void;
  openForm: (editingId?: string) => void;
  closeForm: () => void;
}

const DEFAULT_FILTERS: Filters = { search: '', from: '', to: '', workoutType: '', exercise: '' };

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  filters: DEFAULT_FILTERS,
  isFormOpen: false,
  editingId: null,
  setFilter: (key, value) => set(s => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  openForm: (editingId = null as unknown as string) => set({ isFormOpen: true, editingId }),
  closeForm: () => set({ isFormOpen: false, editingId: null }),
}));
