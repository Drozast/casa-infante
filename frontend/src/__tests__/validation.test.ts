import { z } from 'zod';

// Replicate the password schema used across auth forms
const passwordSchema = z
  .string()
  .min(8, 'La contrasena debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe incluir al menos una letra mayuscula')
  .regex(/[0-9]/, 'Debe incluir al menos un numero')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Debe incluir al menos un simbolo',
  );

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z
      .string()
      .min(2, 'El apellido debe tener al menos 2 caracteres'),
    email: z.string().email('Correo electronico invalido'),
    phone: z
      .string()
      .regex(/^\+?[0-9]{9,15}$/, 'Numero de telefono invalido')
      .optional()
      .or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });

const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });

describe('Password Validation Schema', () => {
  it('should accept a valid password', () => {
    const result = passwordSchema.safeParse('Password1!');
    expect(result.success).toBe(true);
  });

  it('should reject password shorter than 8 characters', () => {
    const result = passwordSchema.safeParse('Pass1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('8 caracteres');
    }
  });

  it('should reject password without uppercase', () => {
    const result = passwordSchema.safeParse('password1!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('mayuscula');
    }
  });

  it('should reject password without number', () => {
    const result = passwordSchema.safeParse('Password!');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('numero');
    }
  });

  it('should reject password without symbol', () => {
    const result = passwordSchema.safeParse('Password1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('simbolo');
    }
  });
});

describe('Register Validation Schema', () => {
  const validData = {
    firstName: 'Maria',
    lastName: 'Gonzalez',
    email: 'maria@example.cl',
    password: 'Password1!',
    confirmPassword: 'Password1!',
  };

  it('should accept valid registration data', () => {
    const result = registerSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept registration with optional phone', () => {
    const result = registerSchema.safeParse({
      ...validData,
      phone: '+56912345678',
    });
    expect(result.success).toBe(true);
  });

  it('should accept registration with empty phone', () => {
    const result = registerSchema.safeParse({ ...validData, phone: '' });
    expect(result.success).toBe(true);
  });

  it('should reject short first name', () => {
    const result = registerSchema.safeParse({ ...validData, firstName: 'A' });
    expect(result.success).toBe(false);
  });

  it('should reject short last name', () => {
    const result = registerSchema.safeParse({ ...validData, lastName: 'B' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = registerSchema.safeParse({
      ...validData,
      email: 'not-email',
    });
    expect(result.success).toBe(false);
  });

  it('should reject mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validData,
      confirmPassword: 'DifferentPassword1!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmErr = result.error.issues.find(
        (i) => i.path.includes('confirmPassword'),
      );
      expect(confirmErr?.message).toContain('no coinciden');
    }
  });

  it('should reject invalid phone format', () => {
    const result = registerSchema.safeParse({
      ...validData,
      phone: '123',
    });
    expect(result.success).toBe(false);
  });
});

describe('Reset Password Validation Schema', () => {
  it('should accept valid reset password data', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'NewPassword1!',
      confirmPassword: 'NewPassword1!',
    });
    expect(result.success).toBe(true);
  });

  it('should reject mismatched passwords', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'NewPassword1!',
      confirmPassword: 'Different1!',
    });
    expect(result.success).toBe(false);
  });

  it('should reject weak new password', () => {
    const result = resetPasswordSchema.safeParse({
      newPassword: 'weak',
      confirmPassword: 'weak',
    });
    expect(result.success).toBe(false);
  });
});
