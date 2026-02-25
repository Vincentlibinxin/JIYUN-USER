describe('Validation Functions', () => {
  // Test phone validation
  describe('Phone Validation', () => {
    const validatePhone = (phone: string): boolean => {
      return /^09\d{8}$/.test(phone);
    };

    it('should accept valid Taiwan phone numbers (09xxxxxxxx)', () => {
      expect(validatePhone('0912345678')).toBe(true);
      expect(validatePhone('0987654321')).toBe(true);
      expect(validatePhone('0900000000')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('0812345678')).toBe(false); // 08开头
      expect(validatePhone('912345678')).toBe(false); // 没有0
      expect(validatePhone('09123456')).toBe(false); // 只有8位
      expect(validatePhone('091234567890')).toBe(false); // 11位
      expect(validatePhone('09abcdefgh')).toBe(false); // 包含字母
    });
  });

  // Test username validation
  describe('Username Validation', () => {
    const validateUsername = (username: string): boolean => {
      if (username.length < 6) return false;
      if (!/^[a-zA-Z0-9]+$/.test(username)) return false;
      return true;
    };

    it('should accept valid usernames', () => {
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('abc123def')).toBe(true);
      expect(validateUsername('Admin2025')).toBe(true);
    });

    it('should reject usernames with less than 6 characters', () => {
      expect(validateUsername('user1')).toBe(false);
      expect(validateUsername('abc')).toBe(false);
    });

    it('should reject usernames with special characters', () => {
      expect(validateUsername('user@123')).toBe(false);
      expect(validateUsername('user-123')).toBe(false);
      expect(validateUsername('user_123')).toBe(false);
    });

    it('should reject usernames with spaces', () => {
      expect(validateUsername('user 123')).toBe(false);
    });
  });

  // Test password validation
  describe('Password Validation', () => {
    const validatePassword = (password: string): string | null => {
      if (password.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (!/[A-Z]/.test(password)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (!/[a-z]/.test(password)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (!/[0-9]/.test(password)) {
        return 'Password must contain at least one digit';
      }
      return null;
    };

    it('should accept valid passwords', () => {
      expect(validatePassword('Abc123456')).toBe(null);
      expect(validatePassword('MyPassword1')).toBe(null);
      expect(validatePassword('Secure2025!@#')).toBe(null);
    });

    it('should reject passwords with less than 8 characters', () => {
      expect(validatePassword('Abc123')).not.toBe(null);
    });

    it('should reject passwords without uppercase letters', () => {
      expect(validatePassword('password123')).not.toBe(null);
    });

    it('should reject passwords without lowercase letters', () => {
      expect(validatePassword('PASSWORD123')).not.toBe(null);
    });

    it('should reject passwords without digits', () => {
      expect(validatePassword('PasswordABC')).not.toBe(null);
    });
  });
});

// Test OTP code generation
describe('OTP Code Generation', () => {
  const generateOTPCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  it('should generate 6-digit OTP codes', () => {
    for (let i = 0; i < 10; i++) {
      const code = generateOTPCode();
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    }
  });

  it('should generate different codes', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateOTPCode());
    }
    expect(codes.size).toBeGreaterThan(95); // At least 95 unique codes out of 100
  });
});

// Test E164 phone conversion
describe('Phone Format Conversion', () => {
  const convertPhoneToE164 = (phone: string): string => {
    return '+886' + phone.substring(1); // 09xxx -> +8869xxx
  };

  it('should convert Taiwan phone numbers to E164 format', () => {
    expect(convertPhoneToE164('0912345678')).toBe('+886912345678');
    expect(convertPhoneToE164('0987654321')).toBe('+886987654321');
  });

  it('should handle different phone numbers correctly', () => {
    const phone1 = '0912345678';
    const phone2 = '0900000000';
    
    expect(convertPhoneToE164(phone1)).toMatch(/^\+886/);
    expect(convertPhoneToE164(phone2)).toMatch(/^\+8869/);
  });
});
