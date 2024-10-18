import { useState, useCallback } from 'react';

type UseUserInputPromptOptions = {
  defaultValue?: string;
  validator?: (value: string) => boolean;
};

export const useUserInputPrompt = (message: string, options: UseUserInputPromptOptions = {}) => {
  const [value, setValue] = useState<string >("");
  const promptUser = useCallback(() => {
    let input: string | null;
    do {
      input = window.prompt(message, options.defaultValue);
      if (input === null) {
        // User cancelled the prompt
        return "";
      }
    } while (options.validator && !options.validator(input));

    setValue(input);
    return input;
  }, [message, options.defaultValue, options.validator]);

  return [value, promptUser] as const;
};