import { describe, expect, test } from 'bun:test'
import {
    pageVariants,
    fadeInVariants,
    fadeInUpVariants,
    staggerContainerVariants,
    staggerItemVariants,
    scaleFadeVariants,
    backdropVariants,
    slideInRightVariants,
    progressVariants,
    statsVariants,
    heroVariants,
    cardHoverAnimation,
    cardTapAnimation
} from './animations'

describe('animation variants', () => {
    describe('pageVariants', () => {
        test('has initial, animate, and exit states', () => {
            expect(pageVariants.initial).toBeDefined()
            expect(pageVariants.animate).toBeDefined()
            expect(pageVariants.exit).toBeDefined()
        })

        test('initial state has opacity 0', () => {
            expect((pageVariants.initial as any).opacity).toBe(0)
        })

        test('animate state has opacity 1', () => {
            expect((pageVariants.animate as any).opacity).toBe(1)
        })
    })

    describe('fadeInVariants', () => {
        test('has initial and animate states', () => {
            expect(fadeInVariants.initial).toBeDefined()
            expect(fadeInVariants.animate).toBeDefined()
        })

        test('initial opacity is 0', () => {
            expect((fadeInVariants.initial as any).opacity).toBe(0)
        })

        test('animate opacity is 1', () => {
            expect((fadeInVariants.animate as any).opacity).toBe(1)
        })
    })

    describe('fadeInUpVariants', () => {
        test('has initial and animate states', () => {
            expect(fadeInUpVariants.initial).toBeDefined()
            expect(fadeInUpVariants.animate).toBeDefined()
        })

        test('initial state has y offset', () => {
            expect((fadeInUpVariants.initial as any).y).toBe(30)
        })

        test('animate state has y at 0', () => {
            expect((fadeInUpVariants.animate as any).y).toBe(0)
        })
    })

    describe('staggerContainerVariants', () => {
        test('has initial and animate states', () => {
            expect(staggerContainerVariants.initial).toBeDefined()
            expect(staggerContainerVariants.animate).toBeDefined()
        })

        test('animate has stagger transition', () => {
            const animate = staggerContainerVariants.animate as any
            expect(animate.transition.staggerChildren).toBeDefined()
            expect(animate.transition.delayChildren).toBeDefined()
        })
    })

    describe('staggerItemVariants', () => {
        test('has initial and animate states', () => {
            expect(staggerItemVariants.initial).toBeDefined()
            expect(staggerItemVariants.animate).toBeDefined()
        })

        test('initial state has opacity 0 and scale less than 1', () => {
            const initial = staggerItemVariants.initial as any
            expect(initial.opacity).toBe(0)
            expect(initial.scale).toBe(0.95)
        })
    })

    describe('scaleFadeVariants', () => {
        test('has initial, animate, and exit states', () => {
            expect(scaleFadeVariants.initial).toBeDefined()
            expect(scaleFadeVariants.animate).toBeDefined()
            expect(scaleFadeVariants.exit).toBeDefined()
        })

        test('initial state has scaled down effect', () => {
            const initial = scaleFadeVariants.initial as any
            expect(initial.scale).toBe(0.95)
            expect(initial.opacity).toBe(0)
        })
    })

    describe('backdropVariants', () => {
        test('has initial, animate, and exit states', () => {
            expect(backdropVariants.initial).toBeDefined()
            expect(backdropVariants.animate).toBeDefined()
            expect(backdropVariants.exit).toBeDefined()
        })

        test('animates opacity only', () => {
            expect((backdropVariants.initial as any).opacity).toBe(0)
            expect((backdropVariants.animate as any).opacity).toBe(1)
            expect((backdropVariants.exit as any).opacity).toBe(0)
        })
    })

    describe('slideInRightVariants', () => {
        test('has initial, animate, and exit states', () => {
            expect(slideInRightVariants.initial).toBeDefined()
            expect(slideInRightVariants.animate).toBeDefined()
            expect(slideInRightVariants.exit).toBeDefined()
        })

        test('initial state is off-screen to the right', () => {
            expect((slideInRightVariants.initial as any).x).toBe('100%')
        })

        test('animate state is at normal position', () => {
            expect((slideInRightVariants.animate as any).x).toBe(0)
        })
    })

    describe('progressVariants', () => {
        test('has initial and animate states', () => {
            expect(progressVariants.initial).toBeDefined()
            expect(progressVariants.animate).toBeDefined()
        })

        test('initial width is 0', () => {
            expect((progressVariants.initial as any).width).toBe(0)
        })

        test('animate is a function that takes width parameter', () => {
            expect(typeof progressVariants.animate).toBe('function')
            const result = (progressVariants.animate as (width: number) => any)(50)
            expect(result.width).toBe('50%')
        })
    })

    describe('statsVariants', () => {
        test('has initial and animate states', () => {
            expect(statsVariants.initial).toBeDefined()
            expect(statsVariants.animate).toBeDefined()
        })

        test('initial state is scaled down', () => {
            expect((statsVariants.initial as any).scale).toBe(0.5)
        })

        test('uses custom easing (back ease out)', () => {
            const animate = statsVariants.animate as any
            expect(Array.isArray(animate.transition.ease)).toBe(true)
        })
    })

    describe('heroVariants', () => {
        test('has initial and animate states', () => {
            expect(heroVariants.initial).toBeDefined()
            expect(heroVariants.animate).toBeDefined()
        })

        test('has larger y offset than fadeInUp', () => {
            expect((heroVariants.initial as any).y).toBe(40)
        })
    })

    describe('cardHoverAnimation', () => {
        test('scales up on hover', () => {
            expect(cardHoverAnimation.scale).toBe(1.02)
        })

        test('has transition defined', () => {
            expect(cardHoverAnimation.transition).toBeDefined()
        })
    })

    describe('cardTapAnimation', () => {
        test('scales down on tap', () => {
            expect(cardTapAnimation.scale).toBe(0.98)
        })
    })
})
