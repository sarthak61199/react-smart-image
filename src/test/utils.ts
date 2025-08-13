import { vi } from 'vitest'

// Helper to trigger IntersectionObserver callbacks
export const triggerIntersection = (
    entries: Array<{
        target: Element
        isIntersecting: boolean
        intersectionRatio?: number
    }>
) => {
    const mockObserver = window.IntersectionObserver as any
    const observerInstance = mockObserver.mock.results[mockObserver.mock.results.length - 1]?.value

    if (observerInstance) {
        const callback = mockObserver.mock.calls[mockObserver.mock.calls.length - 1]?.[0]
        if (callback) {
            const mockEntries = entries.map(entry => ({
                target: entry.target,
                isIntersecting: entry.isIntersecting,
                intersectionRatio: entry.intersectionRatio || (entry.isIntersecting ? 1 : 0),
                boundingClientRect: entry.target.getBoundingClientRect(),
                intersectionRect: entry.target.getBoundingClientRect(),
                rootBounds: null,
                time: Date.now(),
            }))
            callback(mockEntries, observerInstance)
        }
    }
}

// Helper to create a mock img element that can trigger load/error events
export const createMockImg = () => {
    const img = document.createElement('img')
    const originalAddEventListener = img.addEventListener.bind(img)

    img.addEventListener = vi.fn((event, handler) => {
        originalAddEventListener(event, handler as EventListener)
    })

    return {
        img,
        triggerLoad: () => {
            const event = new Event('load')
            img.dispatchEvent(event)
        },
        triggerError: () => {
            const event = new Event('error')
            img.dispatchEvent(event)
        }
    }
}

// Helper to wait for next tick (useful for async operations)
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock transformUrl function for testing
export const mockTransformUrl = vi.fn((src: string, width?: number) => {
    if (width) {
        return `${src}?w=${width}`
    }
    return src
})
