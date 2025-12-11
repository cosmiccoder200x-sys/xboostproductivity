import { create } from 'zustand';

interface AddContentModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useAddContentModal = create<AddContentModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
