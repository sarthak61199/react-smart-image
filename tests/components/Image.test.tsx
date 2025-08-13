import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { Image } from '../../src/components/Image'
import { triggerIntersection, mockTransformUrl } from '../__helpers__/utils'
import React from 'react'

// Mock blurhash decode function
vi.mock('blurhash', () => ({
    decode: vi.fn(() => new Uint8ClampedArray(4096))
}))

describe('Image Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockTransformUrl.mockClear()
    })

    describe('Basic Rendering', () => {
        it('should render img element with required props', () => {
            render(<Image src="test.jpg" alt="Test image" />)

            const img = screen.getByRole('img')
            expect(img).toBeInTheDocument()
            expect(img).toHaveAttribute('src', 'test.jpg')
            expect(img).toHaveAttribute('alt', 'Test image')
        })

        it('should apply width and height attributes', () => {
            render(<Image src="test.jpg" alt="Test image" width={800} height={600} />)

            const img = screen.getByRole('img')
            expect(img).toHaveAttribute('width', '800')
            expect(img).toHaveAttribute('height', '600')
        })

        it('should set loading to eager when priority is true', () => {
            render(<Image src="test.jpg" alt="Test image" priority={true} />)

            const img = screen.getByRole('img')
            expect(img).toHaveAttribute('loading', 'eager')
            expect(img).toHaveAttribute('fetchpriority', 'high')
        })

        it('should set loading to lazy by default', () => {
            render(<Image src="test.jpg" alt="Test image" />)

            const img = screen.getByRole('img')
            expect(img).toHaveAttribute('loading', 'lazy')
            expect(img).not.toHaveAttribute('fetchpriority')
        })

        it('should apply aspect ratio style when width and height provided', () => {
            render(<Image src="test.jpg" alt="Test image" width={16} height={9} />)

            const container = screen.getByRole('img').parentElement
            expect(container).toHaveStyle({ aspectRatio: '16 / 9' })
        })
    })

    describe('Responsive Images', () => {
        it('should generate srcSet from breakpoints', () => {
            const breakpoints = {
                '320': 320,
                '768': 768,
                '1024': 1024
            }

            render(<Image src="test.jpg" alt="Test image" breakpoints={breakpoints} />)

            const img = screen.getByRole('img')
            expect(img).toHaveAttribute('srcset', 'test.jpg?w=320 320w, test.jpg?w=768 768w, test.jpg?w=1024 1024w')
        })

        it('should generate sizes from breakpoints', () => {
            const breakpoints = {
                '320': 320,
                '768': '50vw',
                '1024': 1024
            }

            render(<Image src="test.jpg" alt="Test image" breakpoints={breakpoints} />)

            const img = screen.getByRole('img')
            expect(img).toHaveAttribute('sizes', '(min-width: 320px) 320px, (min-width: 768px) 50vw, (min-width: 1024px) 1024px')
        })

        it('should use custom transformUrl for srcSet generation', () => {
            const breakpoints = { '320': 320, '768': 768 }

            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    breakpoints={breakpoints}
                    transformUrl={mockTransformUrl}
                />
            )

            expect(mockTransformUrl).toHaveBeenCalledWith('test.jpg', 320)
            expect(mockTransformUrl).toHaveBeenCalledWith('test.jpg', 768)
        })
    })

    describe('Lazy Loading with deferUntilInView', () => {
        it('should not set src initially when deferUntilInView is true', () => {
            render(<Image src="test.jpg" alt="Test image" deferUntilInView={true} />)

            const img = screen.getByRole('img')
            expect(img).not.toHaveAttribute('src')
        })

        it('should set src when element comes into view', async () => {
            render(<Image src="test.jpg" alt="Test image" deferUntilInView={true} />)

            const img = screen.getByRole('img')
            expect(img).not.toHaveAttribute('src')

            // Simulate intersection
            act(() => {
                triggerIntersection([{
                    target: img,
                    isIntersecting: true
                }])
            })

            await waitFor(() => {
                expect(img).toHaveAttribute('src', 'test.jpg')
            })
        })

        it('should not set srcSet initially when deferUntilInView is true', () => {
            const breakpoints = { '320': 320, '768': 768 }

            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    breakpoints={breakpoints}
                    deferUntilInView={true}
                />
            )

            const img = screen.getByRole('img')
            expect(img).not.toHaveAttribute('srcset')
        })
    })

    describe('BlurHash Placeholder', () => {
        it('should render canvas for blurhash placeholder', () => {
            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    placeholder="blurhash"
                    blurhash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
                />
            )

            const canvas = document.querySelector('canvas')
            expect(canvas).toBeInTheDocument()
            expect(canvas).toHaveAttribute('width', '32')
            expect(canvas).toHaveAttribute('height', '32')
        })

        it('should hide blurhash canvas when image loads', async () => {
            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    placeholder="blurhash"
                    blurhash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
                />
            )

            const canvas = document.querySelector('canvas')
            expect(canvas).toHaveStyle({ opacity: '1' })

            // Simulate image load
            const img = screen.getByRole('img')
            act(() => {
                img.dispatchEvent(new Event('load'))
            })

            await waitFor(() => {
                expect(canvas).toHaveStyle({ opacity: '0' })
            })
        })
    })

    describe('LQIP Placeholder', () => {
        it('should render LQIP placeholder div', () => {
            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    placeholder="lqip"
                />
            )

            const lqipDiv = document.querySelector('div[style*="background-image"]')
            expect(lqipDiv).toBeInTheDocument()
            expect(lqipDiv).toHaveStyle({
                backgroundImage: 'url(test.jpg?lqip)'
            })
        })

        it('should use custom transformUrl for LQIP', () => {
            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    placeholder="lqip"
                    transformUrl={mockTransformUrl}
                />
            )

            expect(mockTransformUrl).toHaveBeenCalledWith('test.jpg', 16)
        })

        it('should hide LQIP placeholder when image loads', async () => {
            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    placeholder="lqip"
                />
            )

            const lqipDiv = document.querySelector('div[style*="background-image"]')
            expect(lqipDiv).toHaveStyle({ opacity: '1' })

            // Simulate image load
            const img = screen.getByRole('img')
            act(() => {
                img.dispatchEvent(new Event('load'))
            })

            await waitFor(() => {
                expect(lqipDiv).toHaveStyle({ opacity: '0' })
            })
        })
    })

    describe('Image Loading States', () => {
        it('should start with opacity 0 and transition to 1 on load', async () => {
            render(<Image src="test.jpg" alt="Test image" />)

            const img = screen.getByRole('img')
            expect(img).toHaveStyle({ opacity: '0' })

            // Simulate image load
            act(() => {
                img.dispatchEvent(new Event('load'))
            })

            await waitFor(() => {
                expect(img).toHaveStyle({ opacity: '1' })
            })
        })

        it('should call onLoad callback when image loads', () => {
            const onLoad = vi.fn()
            render(<Image src="test.jpg" alt="Test image" onLoad={onLoad} />)

            const img = screen.getByRole('img')
            act(() => {
                img.dispatchEvent(new Event('load'))
            })

            expect(onLoad).toHaveBeenCalled()
        })
    })

    describe('Custom Styles', () => {
        it('should apply custom styles to container', () => {
            const customStyle = { margin: '10px', padding: '5px' }
            render(<Image src="test.jpg" alt="Test image" style={customStyle} />)

            const container = screen.getByRole('img').parentElement
            expect(container).toHaveStyle(customStyle)
        })

        it('should preserve objectFit from custom styles', () => {
            const customStyle = { objectFit: 'contain' as const }
            render(<Image src="test.jpg" alt="Test image" style={customStyle} />)

            const img = screen.getByRole('img')
            expect(img).toHaveStyle({ objectFit: 'contain' })
        })

        it('should default to cover objectFit', () => {
            render(<Image src="test.jpg" alt="Test image" />)

            const img = screen.getByRole('img')
            expect(img).toHaveStyle({ objectFit: 'cover' })
        })
    })

    describe('Additional Props', () => {
        it('should pass through additional img attributes', () => {
            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    className="custom-class"
                    id="custom-id"
                    title="Custom title"
                />
            )

            const img = screen.getByRole('img')
            expect(img).toHaveClass('custom-class')
            expect(img).toHaveAttribute('id', 'custom-id')
            expect(img).toHaveAttribute('title', 'Custom title')
        })

        it('should set decoding to async', () => {
            render(<Image src="test.jpg" alt="Test image" />)

            const img = screen.getByRole('img')
            expect(img).toHaveAttribute('decoding', 'async')
        })
    })

    describe('Edge Cases', () => {
        it('should handle missing blurhash gracefully', () => {
            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    placeholder="blurhash"
                    blurhash=""
                />
            )

            const canvas = document.querySelector('canvas')
            expect(canvas).not.toBeInTheDocument()
        })

        it('should handle transformUrl returning same URL', () => {
            const transformUrl = (src: string) => src

            render(
                <Image
                    src="test.jpg"
                    alt="Test image"
                    transformUrl={transformUrl}
                />
            )

            const img = screen.getByRole('img')
            expect(img).toHaveAttribute('src', 'test.jpg')
        })
    })
})
