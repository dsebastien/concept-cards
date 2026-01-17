import { describe, expect, test } from 'bun:test'
import { cn } from './utils'

describe('cn', () => {
    test('returns empty string for no arguments', () => {
        expect(cn()).toBe('')
    })

    test('returns single class name', () => {
        expect(cn('foo')).toBe('foo')
    })

    test('concatenates multiple class names', () => {
        expect(cn('foo', 'bar')).toBe('foo bar')
    })

    test('handles conditional classes with boolean', () => {
        const showBar = false
        const showBarTrue = true
        expect(cn('foo', showBar && 'bar', 'baz')).toBe('foo baz')
        expect(cn('foo', showBarTrue && 'bar', 'baz')).toBe('foo bar baz')
    })

    test('handles undefined and null values', () => {
        expect(cn('foo', undefined, 'bar', null)).toBe('foo bar')
    })

    test('handles object notation', () => {
        expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
    })

    test('handles array of classes', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    test('merges Tailwind classes correctly', () => {
        // tailwind-merge should handle conflicts
        expect(cn('px-2', 'px-4')).toBe('px-4')
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
        expect(cn('p-4', 'p-2')).toBe('p-2')
    })

    test('handles mixed inputs', () => {
        expect(
            cn('base-class', { conditional: true, excluded: false }, ['array-class'], 'final-class')
        ).toBe('base-class conditional array-class final-class')
    })

    test('preserves non-conflicting Tailwind classes', () => {
        expect(cn('px-2', 'py-4')).toBe('px-2 py-4')
        expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })
})
