import { z } from 'zod';

/**
 * Profile Schema Validations
 * Schema definitions for profile-related forms
 */

// Update Profile Schema
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  gender: z.enum(['MALE', 'FEMALE'], {
    message: 'Please select a valid gender'
  }),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// Change Password Schema
export const changePasswordSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
  oldPassword: z
    .string()
    .min(6, 'Current password must be at least 6 characters'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword'],
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ['newPassword'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Change Email Schema
export const changeEmailSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
  newEmail: z
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});

export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
