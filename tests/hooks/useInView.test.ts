import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useInView } from '../../src/hooks/useInView'
import { triggerIntersection } from '../__helpers__/utils'

describe('useInView', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return setTarget function and initial inView state', () => {
        const { result } = renderHook(() => useInView())

        const [setTarget, inView] = result.current
        expect(typeof setTarget).toBe('function')
        expect(inView).toBe(false)
    })

    it('should set inView to true when element intersects', () => {
        const { result } = renderHook(() => useInView())
        const [setTarget] = result.current

        const mockElement = document.createElement('div')

        act(() => {
            setTarget(mockElement)
        })

        act(() => {
            triggerIntersection([{
                target: mockElement,
                isIntersecting: true,
                intersectionRatio: 1
            }])
        })

        expect(result.current[1]).toBe(true)
    })

    it('should disconnect observer once when element intersects and once=true', () => {
        const { result } = renderHook(() => useInView({ once: true }))
        const [setTarget] = result.current

        const mockElement = document.createElement('div')

        act(() => {
            setTarget(mockElement)
        })

        const mockObserver = window.IntersectionObserver as any
        const observerInstance = mockObserver.mock.results[0].value

        act(() => {
            triggerIntersection([{
                target: mockElement,
                isIntersecting: true
            }])
        })

        expect(observerInstance.disconnect).toHaveBeenCalled()
    })

    it('should not disconnect observer when once=false', () => {
        const { result } = renderHook(() => useInView({ once: false }))
        const [setTarget] = result.current

        const mockElement = document.createElement('div')

        act(() => {
            setTarget(mockElement)
        })

        const mockObserver = window.IntersectionObserver as any
        const observerInstance = mockObserver.mock.results[0].value

        act(() => {
            triggerIntersection([{
                target: mockElement,
                isIntersecting: true
            }])
        })

        expect(observerInstance.disconnect).not.toHaveBeenCalled()
    })

    it('should toggle inView state when once=false', () => {
        const { result } = renderHook(() => useInView({ once: false }))
        const [setTarget] = result.current

        const mockElement = document.createElement('div')

        act(() => {
            setTarget(mockElement)
        })

        // Enter view
        act(() => {
            triggerIntersection([{
                target: mockElement,
                isIntersecting: true
            }])
        })

        expect(result.current[1]).toBe(true)

        // Leave view
        act(() => {
            triggerIntersection([{
                target: mockElement,
                isIntersecting: false
            }])
        })

        expect(result.current[1]).toBe(false)
    })

    it('should use custom rootMargin', () => {
        const customRootMargin = '50px 0px 50px 0px'
        const { result } = renderHook(() => useInView({ rootMargin: customRootMargin }))

        // Create a mock element and trigger the hook
        const mockElement = document.createElement('div')
        act(() => {
            result.current[0](mockElement)
        })

        const mockObserver = window.IntersectionObserver as any
        expect(mockObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                rootMargin: customRootMargin
            })
        )
    })

    it('should use custom threshold', () => {
        const customThreshold = [0, 0.5, 1]
        const { result } = renderHook(() => useInView({ threshold: customThreshold }))

        // Create a mock element and trigger the hook
        const mockElement = document.createElement('div')
        act(() => {
            result.current[0](mockElement)
        })

        const mockObserver = window.IntersectionObserver as any
        expect(mockObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                threshold: customThreshold
            })
        )
    })

    it('should disconnect previous observer when target changes', () => {
        const { result } = renderHook(() => useInView())
        const [setTarget] = result.current

        const mockElement1 = document.createElement('div')
        const mockElement2 = document.createElement('div')

        act(() => {
            setTarget(mockElement1)
        })

        const mockObserver = window.IntersectionObserver as any
        const firstObserverInstance = mockObserver.mock.results[0].value

        act(() => {
            setTarget(mockElement2)
        })

        expect(firstObserverInstance.disconnect).toHaveBeenCalled()
    })

    it('should disconnect observer when target is null', () => {
        const { result } = renderHook(() => useInView())
        const [setTarget] = result.current

        const mockElement = document.createElement('div')

        act(() => {
            setTarget(mockElement)
        })

        const mockObserver = window.IntersectionObserver as any
        const observerInstance = mockObserver.mock.results[0].value

        act(() => {
            setTarget(null)
        })

        expect(observerInstance.disconnect).toHaveBeenCalled()
    })
})
