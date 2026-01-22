import { useState, useCallback } from 'react';

/**
 * Form State Interface
 */
interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
}

/**
 * Validation Rules
 */
type ValidationRule<T> = (value: any, values: T) => string | undefined;

type ValidationSchema<T> = Partial<Record<keyof T, ValidationRule<T>[]>>;

/**
 * useForm Hook Options
 */
interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
}

/**
 * useForm Hook Return Type
 */
interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (name: keyof T) => (value: any) => void;
  handleBlur: (name: keyof T) => () => void;
  handleSubmit: () => Promise<void>;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string) => void;
  resetForm: () => void;
  validateField: (name: keyof T) => boolean;
  validateForm: () => boolean;
}

/**
 * useForm Hook
 * Custom hook for handling form state, validation, and submission
 * 
 * @example
 * const form = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationSchema: {
 *     email: [required, email],
 *     password: [required, minLength(6)]
 *   },
 *   onSubmit: async (values) => {
 *     await login(values);
 *   }
 * });
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (name: keyof T): boolean => {
      if (!validationSchema || !validationSchema[name]) {
        return true;
      }

      const rules = validationSchema[name]!;
      const value = state.values[name];

      for (const rule of rules) {
        const error = rule(value, state.values);
        if (error) {
          setState((prev) => ({
            ...prev,
            errors: { ...prev.errors, [name]: error },
          }));
          return false;
        }
      }

      // Clear error if validation passes
      setState((prev) => {
        const newErrors = { ...prev.errors };
        delete newErrors[name];
        return { ...prev, errors: newErrors };
      });

      return true;
    },
    [validationSchema, state.values]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true;

    let isValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validationSchema).forEach((key) => {
      const name = key as keyof T;
      const rules = validationSchema[name]!;
      const value = state.values[name];

      for (const rule of rules) {
        const error = rule(value, state.values);
        if (error) {
          newErrors[name] = error;
          isValid = false;
          break;
        }
      }
    });

    setState((prev) => ({ ...prev, errors: newErrors }));
    return isValid;
  }, [validationSchema, state.values]);

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    (name: keyof T) => (value: any) => {
      setState((prev) => ({
        ...prev,
        values: { ...prev.values, [name]: value },
      }));
    },
    []
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (name: keyof T) => () => {
      setState((prev) => ({
        ...prev,
        touched: { ...prev.touched, [name]: true },
      }));
      validateField(name);
    },
    [validateField]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched
    const allTouched = Object.keys(state.values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Partial<Record<keyof T, boolean>>
    );
    setState((prev) => ({ ...prev, touched: allTouched }));

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await onSubmit(state.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [state.values, validateForm, onSubmit]);

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [name]: value },
    }));
  }, []);

  /**
   * Set field error programmatically
   */
  const setFieldError = useCallback((name: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
    });
  }, [initialValues]);

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateField,
    validateForm,
  };
}

/**
 * Common Validation Rules
 */
export const validationRules = {
  required: (message = 'This field is required') => (value: any) => {
    return !value || value.toString().trim() === '' ? message : undefined;
  },

  email: (message = 'Invalid email format') => (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && !emailRegex.test(value) ? message : undefined;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    const msg = message || `Must be at least ${min} characters`;
    return value && value.length < min ? msg : undefined;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    const msg = message || `Must be at most ${max} characters`;
    return value && value.length > max ? msg : undefined;
  },

  pattern: (regex: RegExp, message: string) => (value: string) => {
    return value && !regex.test(value) ? message : undefined;
  },

  match: (fieldName: string, message?: string) => (value: any, values: any) => {
    const msg = message || `Must match ${fieldName}`;
    return value !== values[fieldName] ? msg : undefined;
  },

  strongPassword: (message = 'Password must contain uppercase, lowercase, and number') => (
    value: string
  ) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return value && !passwordRegex.test(value) ? message : undefined;
  },
};
