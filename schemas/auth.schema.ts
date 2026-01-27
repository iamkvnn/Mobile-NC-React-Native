import { z } from 'zod';

// ============================================
// Common Validators
// ============================================
const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format');

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(6, 'Password must be at least 6 characters');

const nameSchema = z
  .string()
  .min(1, 'Full name is required')
  .min(2, 'Full name must be at least 2 characters');

// ============================================
// Login Schema
// ============================================
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// Register Schema
// ============================================
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  gender: z.enum(['MALE', 'FEMALE'], {
    message: 'Please select a gender',
  }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================
// Forgot Password Schema
// ============================================
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================
// Reset Password Schema
// ============================================
export const resetPasswordSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be 6 digits'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================
// Verify OTP Schema
// ============================================
export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be 6 digits'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
