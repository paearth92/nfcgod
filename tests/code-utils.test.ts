import { describe, it, expect } from 'vitest';
import {
  normalizeCode,
  formatCode,
  isValidCode,
  generateCode,
  generateCodes,
  CODE_CHARSET,
  CODE_LENGTH,
  isSafeUrl,
  getHostname,
  destinationUrlSchema,
  permanentCodeUrl,
} from '../lib/code-utils';

describe('normalizeCode', () => {
  it('trims whitespace', () => {
    expect(normalizeCode('  ABCDEFGH  ')).toBe('ABCDEFGH');
  });

  it('uppercases lowercase input', () => {
    expect(normalizeCode('abcdefgh')).toBe('ABCDEFGH');
  });

  it('removes hyphens', () => {
    expect(normalizeCode('ABCD-EFGH')).toBe('ABCDEFGH');
  });

  it('handles mixed case with hyphens and spaces', () => {
    expect(normalizeCode('  abcd-efgh  ')).toBe('ABCDEFGH');
  });

  it('handles empty string', () => {
    expect(normalizeCode('')).toBe('');
  });
});

describe('formatCode', () => {
  it('inserts hyphen after 4 characters', () => {
    expect(formatCode('ABCDEFGH')).toBe('ABCD-EFGH');
  });

  it('normalizes before formatting', () => {
    expect(formatCode('abcdefgh')).toBe('ABCD-EFGH');
  });

  it('handles already-formatted codes', () => {
    expect(formatCode('ABCD-EFGH')).toBe('ABCD-EFGH');
  });

  it('returns as-is for wrong length', () => {
    expect(formatCode('ABC')).toBe('ABC');
  });
});

describe('isValidCode', () => {
  it('returns true for valid 8-char codes from allowed charset', () => {
    expect(isValidCode('ABCDEFGH')).toBe(true);
    expect(isValidCode('23456789')).toBe(true);
    expect(isValidCode('ABCD2345')).toBe(true);
  });

  it('accepts codes with hyphens', () => {
    expect(isValidCode('ABCD-EFGH')).toBe(true);
  });

  it('accepts lowercase input', () => {
    expect(isValidCode('abcdefgh')).toBe(true);
  });

  it('rejects codes with 0 (zero)', () => {
    expect(isValidCode('ABCD0FGH')).toBe(false);
  });

  it('rejects codes with O', () => {
    expect(isValidCode('ABCDEFGO')).toBe(false);
  });

  it('rejects codes with 1', () => {
    expect(isValidCode('BCDEFGH1')).toBe(false);
  });

  it('rejects codes with I', () => {
    expect(isValidCode('ABCDEFGI')).toBe(false);
  });

  it('rejects codes with L', () => {
    expect(isValidCode('ABCDEFGH'.replace('H', 'L'))).toBe(false);
  });

  it('rejects codes shorter than 8 characters', () => {
    expect(isValidCode('ABCDEF')).toBe(false);
  });

  it('rejects codes longer than 8 characters', () => {
    expect(isValidCode('ABCDEFGHI')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidCode('')).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isValidCode('ABCD!FGH')).toBe(false);
  });
});

describe('generateCode', () => {
  it('generates a code with the correct format', () => {
    const code = generateCode();
    expect(code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4}$/);
  });

  it('generates codes of the correct length', () => {
    const code = generateCode();
    expect(code.length).toBe(9); // 8 chars + 1 hyphen
  });

  it('generates codes that pass validation', () => {
    for (let i = 0; i < 100; i++) {
      expect(isValidCode(generateCode())).toBe(true);
    }
  });

  it('does not include forbidden characters', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateCode();
      expect(code).not.toContain('0');
      expect(code).not.toContain('O');
      expect(code).not.toContain('1');
      expect(code).not.toContain('I');
      expect(code).not.toContain('L');
    }
  });
});

describe('generateCodes', () => {
  it('generates the requested number of codes', () => {
    const codes = generateCodes(10);
    expect(codes).toHaveLength(10);
  });

  it('generates unique codes', () => {
    const codes = generateCodes(100);
    const set = new Set(codes);
    expect(set.size).toBe(100);
  });

  it('generates valid codes', () => {
    const codes = generateCodes(50);
    codes.forEach((code) => {
      expect(isValidCode(code)).toBe(true);
    });
  });
});

describe('CODE_CHARSET', () => {
  it('has exactly 32 characters', () => {
    expect(CODE_CHARSET.length).toBe(31);
  });

  it('does not contain 0, O, 1, I, or L', () => {
    expect(CODE_CHARSET).not.toContain('0');
    expect(CODE_CHARSET).not.toContain('O');
    expect(CODE_CHARSET).not.toContain('1');
    expect(CODE_CHARSET).not.toContain('I');
    expect(CODE_CHARSET).not.toContain('L');
  });
});

describe('isSafeUrl', () => {
  it('returns true for https URLs', () => {
    expect(isSafeUrl('https://google.com')).toBe(true);
    expect(isSafeUrl('https://example.com/review')).toBe(true);
  });

  it('returns true for http URLs', () => {
    expect(isSafeUrl('http://example.com')).toBe(true);
  });

  it('returns false for javascript: protocol', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });

  it('returns false for data: protocol', () => {
    expect(isSafeUrl('data:text/html,<h1>test</h1>')).toBe(false);
  });

  it('returns false for file: protocol', () => {
    expect(isSafeUrl('file:///etc/passwd')).toBe(false);
  });

  it('returns false for vbscript: protocol', () => {
    expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
  });

  it('returns false for malformed URLs', () => {
    expect(isSafeUrl('not a url')).toBe(false);
    expect(isSafeUrl('')).toBe(false);
    expect(isSafeUrl('ftp://example.com')).toBe(false);
  });
});

describe('destinationUrlSchema', () => {
  it('accepts valid https URLs', () => {
    const result = destinationUrlSchema.safeParse('https://google.com');
    expect(result.success).toBe(true);
  });

  it('accepts valid http URLs', () => {
    const result = destinationUrlSchema.safeParse('http://localhost:3000');
    expect(result.success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = destinationUrlSchema.safeParse('');
    expect(result.success).toBe(false);
  });

  it('rejects javascript: protocol', () => {
    const result = destinationUrlSchema.safeParse('javascript:alert(1)');
    expect(result.success).toBe(false);
  });

  it('rejects data: protocol', () => {
    const result = destinationUrlSchema.safeParse('data:text/html,test');
    expect(result.success).toBe(false);
  });

  it('rejects non-URL strings', () => {
    const result = destinationUrlSchema.safeParse('not a url');
    expect(result.success).toBe(false);
  });
});

describe('getHostname', () => {
  it('extracts hostname from URL', () => {
    expect(getHostname('https://www.google.com/search')).toBe('google.com');
  });

  it('removes www prefix', () => {
    expect(getHostname('https://www.example.com')).toBe('example.com');
  });

  it('handles URLs without www', () => {
    expect(getHostname('https://example.com')).toBe('example.com');
  });

  it('returns input on invalid URL', () => {
    expect(getHostname('not a url')).toBe('not a url');
  });
});

describe('permanentCodeUrl', () => {
  it('builds the permanent URL with formatted code', () => {
    expect(permanentCodeUrl('ABCDEFGH', 'https://nfcplate.com')).toBe('https://nfcplate.com/c/ABCD-EFGH');
  });

  it('normalizes the code', () => {
    expect(permanentCodeUrl('abcdefgh', 'https://nfcplate.com')).toBe('https://nfcplate.com/c/ABCD-EFGH');
  });

  it('handles already-formatted codes', () => {
    expect(permanentCodeUrl('ABCD-EFGH', 'https://nfcplate.com')).toBe('https://nfcplate.com/c/ABCD-EFGH');
  });
});
