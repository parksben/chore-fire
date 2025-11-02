import { finder as getElementSelector } from '@medv/finder'
import { snapdom } from '@zumer/snapdom'

export { getElementSelector }

let highlightTimeout: NodeJS.Timeout | null = null

export function highlightElement(selector: string) {
  if (highlightTimeout) {
    clearTimeout(highlightTimeout)
    highlightTimeout = null
  }

  try {
    const element = document.querySelector(selector) as Element

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

export async function screenshotElement(element: Element): Promise<string> {
  try {
    const canvas = await snapdom.toCanvas(element, {
      quality: 1,
      dpr: window.devicePixelRatio || 1,
    })

    const mime = 'image/png'
    const quality = 1

    const blob = (await new Promise((resolve) => {
      if (canvas.toBlob) {
        canvas.toBlob(
          (b) => {
            if (b instanceof Blob) resolve(b)
          },
          mime,
          quality,
        )
      } else {
        const dataURL = canvas.toDataURL(mime, quality)
        const [, base64] = dataURL.split(',')
        const binary = atob(base64)
        const array = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
        resolve(new Blob([array], { type: mime }))
      }
    })) as Blob

    return uploadImage(blob)
  } catch {
    return ''
  }
}

export async function uploadImage(imageBlob: Blob): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', imageBlob, 'screenshot.png')

    const response = await fetch('/chore-fire/image', {
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

export function getSourcCodeLocation(element: Element): string {
  // NOTE: the attribute `data-insp-path` set by third-part plugin [code-inspector](https://github.com/zh-lx/code-inspector)
  // user can install it in their app to get more accurate source code location
  const locInfo = element.getAttribute('data-insp-path')
  if (locInfo) return locInfo

  const entris = Object.entries(element)

  // for React nodes
  for (const [key, value] of entris) {
    if (key.startsWith('__reactFiber$') && value?._debugSource) {
      const { fileName, lineNumber, columnNumber } = value._debugSource
      return `${fileName}:${lineNumber}:${columnNumber}`
    }
  }

  return ''
}

export function openInEditor(location: string) {
  return fetch('/chore-fire/open-in-editor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location }),
  }).then((res) => res.json())
}
