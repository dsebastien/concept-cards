import { describe, expect, test } from 'bun:test'
import { parseVersion } from './update-version'

describe('parseVersion', () => {
    test('parses version without v prefix', () => {
        expect(parseVersion('1.2.3')).toBe('1.2.3')
    })

    test('parses version with v prefix', () => {
        expect(parseVersion('v1.2.3')).toBe('1.2.3')
    })

    test('throws error for V prefix (uppercase - only lowercase v supported)', () => {
        expect(() => parseVersion('V1.2.3')).toThrow('Invalid version format')
    })

    test('throws error for invalid version format', () => {
        expect(() => parseVersion('invalid')).toThrow('Invalid version format')
    })

    test('throws error for partial version', () => {
        expect(() => parseVersion('1.2')).toThrow('Invalid version format')
    })

    test('throws error for version with extra parts', () => {
        expect(() => parseVersion('1.2.3.4')).toThrow('Invalid version format')
    })

    test('parses version with zero components', () => {
        expect(parseVersion('0.0.0')).toBe('0.0.0')
    })

    test('parses version with large numbers', () => {
        expect(parseVersion('100.200.300')).toBe('100.200.300')
    })

    test('throws error for version with letters in components', () => {
        expect(() => parseVersion('1.2.3a')).toThrow('Invalid version format')
    })

    test('throws error for version with spaces', () => {
        expect(() => parseVersion('1.2.3 ')).toThrow('Invalid version format')
    })

    test('throws error for empty string', () => {
        expect(() => parseVersion('')).toThrow('Invalid version format')
    })
})
