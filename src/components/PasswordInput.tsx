import React, { InputHTMLAttributes, useEffect, useState, useCallback, useRef } from 'react';
import { usePasswordPersistence } from '../contexts/PasswordPersistenceContext';
import styled, { keyframes, css } from 'styled-components';

interface Theme {
  color: {
    global: {
      gray: string;
      contrast: string;
    };
  };
}

const shakeAnimation = keyframes`
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
`;

const TheInput = styled.input<{ $theme: Theme; $shake: boolean }>`
  background-color: ${({ $theme }) => $theme.color.global.gray + '10'};
  border-radius: 0.25rem;
  border: 1px solid ${({ $theme }) => $theme.color.global.gray + '50'};
  font-size: 0.85rem;
  width: 85%;
  height: 2rem;
  padding-left: 0.5rem;
  margin: 0.25rem;
  outline: none;
  text-indent: 0.5rem;
  color: ${({ $theme }) => $theme.color.global.contrast};
  animation: ${({ $shake }) =>
    $shake
      ? css`
          ${shakeAnimation} 0.5s cubic-bezier(.36,.07,.19,.97) both
        `
      : 'none'};

  &::placeholder {
    color: ${({ $theme }) => $theme.color.global.gray};
  }
`;

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  id: string;
  theme: Theme;
  shake?: boolean;
  onChange?: (value: string) => void;
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  theme,
  shake = false,
  onChange,
  ...props
}) => {
  const { getPassword, setPassword } = usePasswordPersistence();
  const [value, setValue] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const previousValueRef = useRef(value);

  // Load initial password
  useEffect(() => {
    const loadPassword = async () => {
      try {
        const storedPassword = await getPassword(id);
        if (storedPassword && !isInitialized) {
          setValue(storedPassword);
          onChange?.(storedPassword);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error loading password:', error);
      }
    };

    if (!isInitialized) {
      loadPassword();
    }
  }, [id, getPassword, onChange, isInitialized]);

  // Handle password updates
  useEffect(() => {
    const updateStoredPassword = async () => {
      if (value !== previousValueRef.current) {
        try {
          await setPassword(id, value);
          previousValueRef.current = value;
        } catch (error) {
          console.error('Error storing password:', error);
        }
      }
    };

    updateStoredPassword();
  }, [id, value, setPassword]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const preventScroll = useCallback((e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
    e.stopPropagation();
    setTimeout(() => {
      e.currentTarget.focus();
    }, 0);
  }, []);

  return (
    <TheInput
      {...props}
      id={id}
      type="password"
      $theme={theme}
      $shake={shake}
      value={value}
      onChange={handleChange}
      onWheel={preventScroll}
    />
  );
};