import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
})

// Make it available globally
Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
})

// Mock HTMLCanvasElement.getContext for blurhash tests
const mockGetContext = vi.fn(() => ({
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4096) })),
    putImageData: vi.fn(),
}))

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    configurable: true,
    value: mockGetContext,
})

// Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks()
})

// Export utilities for tests
export { mockIntersectionObserver, mockGetContext }
