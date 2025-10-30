import { finder as getElementSelector } from '@medv/finder'
import { snapdom } from '@zumer/snapdom'

export { getElementSelector }

let highlightTimeout: NodeJS.Timeout | null = null

export const highlightElement = (selector: string) => {
  if (highlightTimeout) {
    clearTimeout(highlightTimeout)
    highlightTimeout = null
  }

  try {
    const element = document.querySelector(selector) as HTMLElement

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })

      element.classList.add('cf-task-highlight')

      highlightTimeout = setTimeout(() => {
        element.classList.remove('cf-task-highlight')
        highlightTimeout = null
      }, 1500)
    }
  } catch (error) {
    console.error('Failed to highlight element:', error)
  }
}

export const screenshotElement = async (element: HTMLElement): Promise<string> => {
  try {
    const canvas = await snapdom.toCanvas(element, {
      quality: 1,
      dpr: window.devicePixelRatio || 1,
    })
    const dataUrl = canvas.toDataURL('image/png')
    return dataUrl
  } catch {
    return ''
  }
}
