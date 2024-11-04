import { useState, useEffect } from 'react';
import { ChromeStorageService } from '../services/ChromeStorage.service';

const PASSWORD_EXPIRY_TIME = 5; // 5 minutes

export function usePersistedPassword(fieldId: string) {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const storageService = new ChromeStorageService();

  useEffect(() => {
    const loadPersistedValue = async () => {
      try {
        const fieldState = await storageService.getPasswordState(fieldId);
        if (fieldState) {
          const currentPath = window.location.pathname;
          const isExpired = Date.now() - fieldState.timestamp > PASSWORD_EXPIRY_TIME;
          const isSamePath = currentPath === fieldState.path;

          if (!isExpired && isSamePath) {
            setValue(fieldState.value);
          } else {
            await storageService.clearPasswordState(fieldId);
          }
        }
      } catch (error) {
        console.error('Error loading persisted password:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPersistedValue();
  }, [fieldId, storageService]);

  const handleChange = async (newValue: string) => {
    setValue(newValue);
    try {
      await storageService.savePasswordState(
        fieldId,
        newValue,
        window.location.pathname
      );
    } catch (error) {
      console.error('Error saving password state:', error);
    }
  };

  const clearValue = async () => {
    setValue('');
    try {
      await storageService.clearPasswordState(fieldId);
    } catch (error) {
      console.error('Error clearing password state:', error);
    }
  };

  return {
    value,
    setValue: handleChange,
    clearValue,
    isLoading
  };
}