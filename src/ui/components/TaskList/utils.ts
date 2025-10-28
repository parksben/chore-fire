export const getElementSelector = (element: HTMLElement): string => {
  const path: string[] = []
  let current: HTMLElement | null = element

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      selector += `#${current.id}`
      path.unshift(selector)
      break
    } else {
      const parent = current.parentElement
      if (parent && current) {
        const siblings = Array.from(parent.children)
        const index = siblings.indexOf(current)
        if (siblings.filter((s) => s.tagName === current?.tagName).length > 1) {
          selector += `:nth-child(${index + 1})`
        }
      }
      path.unshift(selector)
    }

    current = current.parentElement
  }

  return path.join(' > ')
}

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
