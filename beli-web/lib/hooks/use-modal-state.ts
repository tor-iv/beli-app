'use client'

import { useState, useCallback } from 'react'

export interface ModalState {
  showCategoryModal: boolean
  showParticipantSelector: boolean
  showSelectionScreen: boolean
  showConfirmationModal: boolean
}

export function useModalState(initialState?: Partial<ModalState>) {
  const [modals, setModals] = useState<ModalState>({
    showCategoryModal: initialState?.showCategoryModal ?? true,
    showParticipantSelector: initialState?.showParticipantSelector ?? false,
    showSelectionScreen: initialState?.showSelectionScreen ?? false,
    showConfirmationModal: initialState?.showConfirmationModal ?? false,
  })

  const openCategoryModal = useCallback(() => {
    setModals(prev => ({ ...prev, showCategoryModal: true }))
  }, [])

  const closeCategoryModal = useCallback(() => {
    setModals(prev => ({ ...prev, showCategoryModal: false }))
  }, [])

  const openParticipantSelector = useCallback(() => {
    setModals(prev => ({ ...prev, showParticipantSelector: true }))
  }, [])

  const closeParticipantSelector = useCallback(() => {
    setModals(prev => ({ ...prev, showParticipantSelector: false }))
  }, [])

  const openSelectionScreen = useCallback(() => {
    setModals(prev => ({ ...prev, showSelectionScreen: true }))
  }, [])

  const closeSelectionScreen = useCallback(() => {
    setModals(prev => ({ ...prev, showSelectionScreen: false }))
  }, [])

  const openConfirmationModal = useCallback(() => {
    setModals(prev => ({ ...prev, showConfirmationModal: true }))
  }, [])

  const closeConfirmationModal = useCallback(() => {
    setModals(prev => ({ ...prev, showConfirmationModal: false }))
  }, [])

  return {
    modals,
    openCategoryModal,
    closeCategoryModal,
    openParticipantSelector,
    closeParticipantSelector,
    openSelectionScreen,
    closeSelectionScreen,
    openConfirmationModal,
    closeConfirmationModal,
  }
}
