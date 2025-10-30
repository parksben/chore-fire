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
    const blob = await snapdom.toBlob(element, {
      quality: 0.9,
      dpr: window.devicePixelRatio || 1,
    })
    return uploadImage(blob)
  } catch {
    return ''
  }
}

export const uploadImage = async (imageBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', imageBlob, 'screenshot.png')

    const response = await fetch('/chore-fire/upload-image', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    if (result?.data?.url) {
      return `${window.location.origin}/chore-fire${result.data.url}`
    } else {
      return ''
    }
  } catch {
    return ''
  }
}
