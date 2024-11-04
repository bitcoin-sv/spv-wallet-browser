import React, { createContext, useContext, useState, useEffect } from 'react'
import { ChromeStorageService } from '../services/ChromeStorage.service'

interface PasswordFieldState {
  value: string
  path: string
  timestamp: number
}

interface PasswordPersistenceContextType {
  getPassword: (fieldId: string) => Promise<string>
  setPassword: (fieldId: string, value: string) => Promise<void>
  clearPassword: (fieldId: string) => Promise<void>
  clearAllPasswords: () => Promise<void>
}

const PasswordPersistenceContext = createContext<PasswordPersistenceContextType | null>(null)

export const usePasswordPersistence = () => {
  const context = useContext(PasswordPersistenceContext)
  if (!context) {
    throw new Error('usePasswordPersistence must be used within a PasswordPersistenceProvider')
  }
  return context
}

export const PasswordPersistenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storageService = new ChromeStorageService()

  const getPassword = async (fieldId: string): Promise<string> => {
    try {
      const passwordState = await storageService.getPasswordState(fieldId)
      return passwordState?.value || ''
    } catch (error) {
      console.error('Error getting password:', error)
      return ''
    }
  }

  const setPassword = async (fieldId: string, value: string): Promise<void> => {
    try {
      await storageService.savePasswordState(fieldId, value, window.location.pathname)
    } catch (error) {
      console.error('Error saving password:', error)
    }
  }

  const clearPassword = async (fieldId: string): Promise<void> => {
    try {
      await storageService.clearPasswordState(fieldId)
    } catch (error) {
      console.error('Error clearing password:', error)
    }
  }

  const clearAllPasswords = async (): Promise<void> => {
    try {
      await storageService.clearAllPasswordStates()
    } catch (error) {
      console.error('Error clearing all passwords:', error)
    }
  }

  return (
    <PasswordPersistenceContext.Provider value={{ getPassword, setPassword, clearPassword, clearAllPasswords }}>
      {children}
    </PasswordPersistenceContext.Provider>
  )
}