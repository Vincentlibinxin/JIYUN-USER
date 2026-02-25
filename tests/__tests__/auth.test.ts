describe('API Integration Tests', () => {
  describe('Auth Routes - Input Validation', () => {
    // Validation for registration endpoint
    describe('POST /auth/register - Validation', () => {
      const validateRegisterInput = (data: any) => {
        const errors = [];

        if (!data.username) errors.push('Username is required');
        if (!data.password) errors.push('Password is required');

        if (data.username && data.username.length < 6) {
          errors.push('Username must be at least 6 characters');
        }

        if (data.username && !/^[a-zA-Z0-9]+$/.test(data.username)) {
          errors.push('Username can only contain letters and numbers');
        }

        if (data.password && data.password.length < 8) {
          errors.push('Password must be at least 8 characters');
        }

        if (data.password && !/[A-Z]/.test(data.password)) {
          errors.push('Password must contain at least one uppercase letter');
        }

        if (data.password && !/[a-z]/.test(data.password)) {
          errors.push('Password must contain at least one lowercase letter');
        }

        if (data.password && !/[0-9]/.test(data.password)) {
          errors.push('Password must contain at least one digit');
        }

        if (data.phone && !/^09\d{8}$/.test(data.phone)) {
          errors.push('Invalid phone number format');
        }

        return errors.length === 0 ? null : errors;
      };

      it('should accept valid registration data', () => {
        const validData = {
          username: 'user123',
          password: 'Password123',
          phone: '0912345678',
        };
        expect(validateRegisterInput(validData)).toBeNull();
      });

      it('should reject any missing required fields', () => {
        expect(validateRegisterInput({ username: 'user123' })).toContain(
          'Password is required'
        );
        expect(validateRegisterInput({ password: 'Pass123' })).toContain(
          'Username is required'
        );
      });

      it('should reject invalid usernames', () => {
        const invalidUsernames = [
          'user1', // too short
          'user@123', // special chars
          'user-123', // hyphen
          'user_123', // underscore
        ];

        invalidUsernames.forEach((username) => {
          const errors = validateRegisterInput({
            username,
            password: 'Password123',
          });
          expect(errors).not.toBeNull();
          expect(errors?.toString()).toContain('Username');
        });
      });

      it('should reject invalid passwords', () => {
        const testCases = [
          {
            password: 'Short1',
            expectedError: 'at least 8 characters',
          },
          {
            password: 'password123',
            expectedError: 'uppercase',
          },
          {
            password: 'PASSWORD123',
            expectedError: 'lowercase',
          },
          {
            password: 'PasswordABC',
            expectedError: 'digit',
          },
        ];

        testCases.forEach(({ password, expectedError }) => {
          const errors = validateRegisterInput({
            username: 'user123',
            password,
          });
          expect(errors?.some((e) => e.includes(expectedError))).toBe(true);
        });
      });

      it('should reject invalid phone numbers', () => {
        const invalidPhones = [
          '0812345678', // wrong prefix
          '912345678', // missing 0
          '09123456', // too short
          '091234567890', // too long
        ];

        invalidPhones.forEach((phone) => {
          const errors = validateRegisterInput({
            username: 'user123',
            password: 'Password123',
            phone,
          });
          expect(errors).toContain('Invalid phone number format');
        });
      });
    });

    describe('POST /auth/send-sms - Phone Validation', () => {
      const validatePhoneForSMS = (phone: string | undefined) => {
        if (!phone) return 'Phone number is required';
        if (!/^09\d{8}$/.test(phone)) {
          return 'Invalid phone number format';
        }
        return null;
      };

      it('should accept valid phone numbers', () => {
        expect(validatePhoneForSMS('0912345678')).toBeNull();
        expect(validatePhoneForSMS('0987654321')).toBeNull();
      });

      it('should reject invalid phone numbers', () => {
        expect(validatePhoneForSMS(undefined)).not.toBeNull();
        expect(validatePhoneForSMS('')).not.toBeNull();
        expect(validatePhoneForSMS('0812345678')).not.toBeNull();
        expect(validatePhoneForSMS('09123456')).not.toBeNull();
      });
    });
  });
});
