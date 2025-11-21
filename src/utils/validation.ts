import { z } from 'zod';

/**
 * Validation schemas for form inputs
 * Using Zod for type-safe validation
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(255, 'Email is too long');

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

// Kenyan phone number validation
export const kenyanPhoneSchema = z
  .string()
  .regex(
    /^(\+?254|0)?[17]\d{8}$/,
    'Invalid Kenyan phone number. Use format: 0712345678 or +254712345678'
  )
  .transform((val) => {
    // Normalize to +254 format
    const cleaned = val.replace(/\s+/g, '');
    if (cleaned.startsWith('+254')) return cleaned;
    if (cleaned.startsWith('254')) return `+${cleaned}`;
    if (cleaned.startsWith('0')) return `+254${cleaned.slice(1)}`;
    return `+254${cleaned}`;
  });

// Full name validation
export const fullNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// County validation (Kenyan counties)
export const countySchema = z.string().min(1, 'County is required');

// Latitude validation
export const latitudeSchema = z
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

// Longitude validation
export const longitudeSchema = z
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180');

// Land size validation (hectares)
export const landSizeSchema = z
  .number()
  .positive('Land size must be positive')
  .max(10000, 'Land size seems unreasonably large');

// Notes/description validation
export const notesSchema = z
  .string()
  .max(1000, 'Notes are too long (max 1000 characters)')
  .optional();

// Auth form schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
});

// Profile edit schema
export const profileEditSchema = z.object({
  full_name: fullNameSchema,
  phone: kenyanPhoneSchema.optional().or(z.literal('')),
  county: countySchema.optional(),
  constituency: z.string().max(100, 'Constituency name is too long').optional(),
});

// Verification upload schema
export const verificationSchema = z.object({
  tree_name: z.string().min(1, 'Tree name is required'),
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  planting_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  notes: notesSchema,
});

// Onboarding schema
export const onboardingSchema = z.object({
  county: countySchema,
  constituency: z.string().max(100).optional(),
  agro_zone: z.string().min(1, 'Agro-ecological zone is required'),
  soil_type: z.enum(['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky'], {
    errorMap: () => ({ message: 'Please select a valid soil type' }),
  }),
  climate_zone: z.enum(['tropical', 'temperate', 'cold', 'mediterranean'], {
    errorMap: () => ({ message: 'Please select a valid climate zone' }),
  }),
  land_size_hectares: landSizeSchema,
  conservation_goals: z
    .array(
      z.enum([
        'aesthetic_beauty',
        'biodiversity',
        'carbon_sequestration',
        'erosion_control',
        'food_production',
        'water_management',
        'wildlife_habitat',
      ])
    )
    .min(1, 'Please select at least one conservation goal'),
  phone: kenyanPhoneSchema,
});

/**
 * Helper function to validate and sanitize input
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate and format Kenyan phone number
 */
export function validateKenyanPhone(phone: string): boolean {
  return kenyanPhoneSchema.safeParse(phone).success;
}

/**
 * Format Kenyan phone number to standard format
 */
export function formatKenyanPhone(phone: string): string {
  const result = kenyanPhoneSchema.safeParse(phone);
  if (result.success) {
    return result.data;
  }
  return phone; // Return original if invalid
}

