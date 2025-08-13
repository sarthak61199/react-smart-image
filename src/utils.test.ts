import { describe, it, expect } from 'vitest'
import { getSrcSet, getSizes, getAspectStyle } from './utils'
import { Breakpoints } from './types'

describe('utils', () => {
    describe('getSrcSet', () => {
        it('should return undefined when no breakpoints provided', () => {
            const result = getSrcSet(undefined, undefined, 'test.jpg')
            expect(result).toBeUndefined()
        })

        it('should generate srcset with default URL transformation', () => {
            const breakpoints: Breakpoints = {
                '320': 320,
                '768': 768,
                '1024': 1024
            }

            const result = getSrcSet(breakpoints, undefined, 'test.jpg')
            expect(result).toBe('test.jpg?w=320 320w, test.jpg?w=768 768w, test.jpg?w=1024 1024w')
        })

        it('should use custom transformUrl when provided', () => {
            const breakpoints: Breakpoints = {
                '320': 320,
                '768': 768
            }

            const transformUrl = (src: string, width?: number) => `https://cdn.example.com/${src}?width=${width}`

            const result = getSrcSet(breakpoints, transformUrl, 'test.jpg')
            expect(result).toBe('https://cdn.example.com/test.jpg?width=320 320w, https://cdn.example.com/test.jpg?width=768 768w')
        })

        it('should sort breakpoints by width', () => {
            const breakpoints: Breakpoints = {
                '1024': 1024,
                '320': 320,
                '768': 768
            }

            const result = getSrcSet(breakpoints, undefined, 'test.jpg')
            expect(result).toBe('test.jpg?w=320 320w, test.jpg?w=768 768w, test.jpg?w=1024 1024w')
        })

        it('should handle string values by parsing them as integers', () => {
            const breakpoints: Breakpoints = {
                '320': '320',
                '768': '768'
            }

            const result = getSrcSet(breakpoints, undefined, 'test.jpg')
            expect(result).toBe('test.jpg?w=320 320w, test.jpg?w=768 768w')
        })

        it('should filter out invalid numeric values', () => {
            const breakpoints: Breakpoints = {
                '320': 320,
                '768': 'invalid' as any,
                '1024': 1024
            }

            const result = getSrcSet(breakpoints, undefined, 'test.jpg')
            expect(result).toBe('test.jpg?w=320 320w, test.jpg?w=1024 1024w')
        })

        it('should handle empty breakpoints object', () => {
            const breakpoints: Breakpoints = {}

            const result = getSrcSet(breakpoints, undefined, 'test.jpg')
            expect(result).toBe('')
        })
    })

    describe('getSizes', () => {
        it('should return undefined when no breakpoints provided', () => {
            const result = getSizes(undefined)
            expect(result).toBeUndefined()
        })

        it('should generate sizes with numeric values as px', () => {
            const breakpoints: Breakpoints = {
                '320': 320,
                '768': 768,
                '1024': 1024
            }

            const result = getSizes(breakpoints)
            expect(result).toBe('(min-width: 320px) 320px, (min-width: 768px) 768px, (min-width: 1024px) 1024px')
        })

        it('should preserve string values as-is', () => {
            const breakpoints: Breakpoints = {
                '320': '100vw',
                '768': '50vw',
                '1024': '33vw'
            }

            const result = getSizes(breakpoints)
            expect(result).toBe('(min-width: 320px) 100vw, (min-width: 768px) 50vw, (min-width: 1024px) 33vw')
        })

        it('should sort breakpoints by width', () => {
            const breakpoints: Breakpoints = {
                '1024': 1024,
                '320': 320,
                '768': 768
            }

            const result = getSizes(breakpoints)
            expect(result).toBe('(min-width: 320px) 320px, (min-width: 768px) 768px, (min-width: 1024px) 1024px')
        })

        it('should handle mixed numeric and string values', () => {
            const breakpoints: Breakpoints = {
                '320': 320,
                '768': '50vw',
                '1024': 1024
            }

            const result = getSizes(breakpoints)
            expect(result).toBe('(min-width: 320px) 320px, (min-width: 768px) 50vw, (min-width: 1024px) 1024px')
        })

        it('should handle empty breakpoints object', () => {
            const breakpoints: Breakpoints = {}

            const result = getSizes(breakpoints)
            expect(result).toBe('')
        })
    })

    describe('getAspectStyle', () => {
        it('should return aspect ratio style when width and height provided', () => {
            const result = getAspectStyle(16, 9)
            expect(result).toEqual({ aspectRatio: '16 / 9' })
        })

        it('should merge with existing styles', () => {
            const existingStyle = { margin: '10px', color: 'red' }
            const result = getAspectStyle(4, 3, existingStyle)
            expect(result).toEqual({
                aspectRatio: '4 / 3',
                margin: '10px',
                color: 'red'
            })
        })

        it('should return existing style when width is undefined', () => {
            const existingStyle = { margin: '10px' }
            const result = getAspectStyle(undefined, 9, existingStyle)
            expect(result).toEqual({ margin: '10px' })
        })

        it('should return existing style when height is undefined', () => {
            const existingStyle = { padding: '5px' }
            const result = getAspectStyle(16, undefined, existingStyle)
            expect(result).toEqual({ padding: '5px' })
        })

        it('should return empty object when no width, height, or style provided', () => {
            const result = getAspectStyle(undefined, undefined)
            expect(result).toEqual({})
        })

        it('should handle zero values', () => {
            const result = getAspectStyle(0, 9)
            expect(result).toEqual({})
        })

        it('should create aspect ratio with zero height', () => {
            const result = getAspectStyle(16, 0)
            expect(result).toEqual({ aspectRatio: '16 / 0' })
        })

        it('should handle decimal values', () => {
            const result = getAspectStyle(16.5, 9.25)
            expect(result).toEqual({ aspectRatio: '16.5 / 9.25' })
        })
    })
})
