const { parse } = require('@typescript-eslint/typescript-estree')
const MagicString = require('magic-string')

// 将源代码坐标注入到 JSX 元素中
async function jsxCoordinates(code, id) {
  if (!/\.(t|j)sx$/.test(id)) return
  if (process.env.NODE_ENV !== 'development') return

  try {
    const s = new MagicString(code)
    const ast = parse(code, {
      jsx: true,
      loc: true,
      range: true,
      filePath: id,
    })

    const jsxElements = findJSXElements(ast)
    jsxElements.forEach(
      ({ start, end, insertIndex, isStaticText, isStaticImage, isStaticClassName }) => {
        s.appendLeft(
          insertIndex,
          ` data-source-file="${id}" data-source-range="${start.line}:${start.column}-${end.line}:${
            end.column
          }" data-static-text="${isStaticText ? 'true' : 'false'}" data-static-image="${
            isStaticImage ? 'true' : 'false'
          }" data-static-class="${isStaticClassName ? 'true' : 'false'}"`,
        )
      },
    )

    return {
      code: s.toString(),
      map: s.generateMap({ hires: true }),
    }
  } catch (error) {
    console.warn(`[JSX Coordinates] Skipped ${id}:`, error.message)
    return null
  }
}

// 辅助函数：遍历 AST 查找 JSX 元素
function findJSXElements(ast) {
  const elements = []

  const walk = (node) => {
    if (!node || typeof node !== 'object') return

    // 检查是否为静态文本节点
    const isStaticText =
      node.children?.length &&
      node.children.every((child) => {
        // JSX 文本节点（包括空白节点）
        if (child.type === 'JSXText') {
          return true
        }

        // 字符串字面量表达式
        if (
          child.type === 'JSXExpressionContainer' &&
          child.expression.type === 'Literal' &&
          typeof child.expression.value === 'string'
        ) {
          return true
        }

        // 仅允许特定的格式化自闭合标签
        if (child.type === 'JSXElement' && child.openingElement.selfClosing) {
          const tagName = child.openingElement.name.name
          if (['br', 'hr', 'wbr'].includes(tagName)) {
            return true
          }
        }

        // 允许注释节点
        if (child.type === 'JSXEmptyExpression' || child.type === 'JSXSpreadChild') {
          return true
        }

        return false
      })

    // 检查是否为静态图片节点
    let isStaticImage = false
    if (
      (node.type === 'JSXElement' && node.openingElement.name.name === 'img') ||
      (node.type === 'JSXOpeningElement' && node.name.name === 'img')
    ) {
      const attributes =
        node.type === 'JSXElement' ? node.openingElement.attributes : node.attributes
      const srcValue = (attributes || []).find(
        (x) => x.type === 'JSXAttribute' && x.name.name === 'src',
      )?.value

      if (srcValue) {
        if (srcValue.type === 'Literal' && typeof srcValue.value === 'string') {
          isStaticImage = true
        }
        if (
          srcValue.type === 'JSXExpressionContainer' &&
          srcValue.expression.type === 'Literal' &&
          typeof srcValue.expression.value === 'string'
        ) {
          isStaticImage = true
        }
      }
    }

    // 检查是否为静态类名节点
    let isStaticClassName = false
    if (node.type === 'JSXElement' || node.type === 'JSXOpeningElement') {
      const attributes =
        node.type === 'JSXElement' ? node.openingElement.attributes : node.attributes
      const classNameValue = (attributes || []).find(
        (x) => x.type === 'JSXAttribute' && x.name.name === 'className',
      )?.value

      if (!classNameValue) {
        isStaticClassName = true
      } else {
        if (classNameValue.type === 'Literal' && typeof classNameValue.value === 'string') {
          isStaticClassName = true
        }
        if (
          classNameValue.type === 'JSXExpressionContainer' &&
          classNameValue.expression.type === 'Literal' &&
          typeof classNameValue.expression.value === 'string'
        ) {
          isStaticClassName = true
        }
      }
    }

    // 检查 JSXElement 节点类型
    if (node.type === 'JSXElement') {
      const openingElement = node.openingElement
      const selfClosing = openingElement.selfClosing

      elements.push({
        start: openingElement.loc.start,
        end: selfClosing
          ? openingElement.loc.end
          : node.closingElement?.loc.end || openingElement.loc.end,
        insertIndex: openingElement.range[1] - (selfClosing ? 2 : 1),
        isStaticText,
        isStaticImage,
        isStaticClassName,
      })
    }

    // 检查自闭合的 JSXElement（可能直接是 JSXOpeningElement）
    if (node.type === 'JSXOpeningElement' && node.selfClosing) {
      elements.push({
        start: node.loc.start,
        end: node.loc.end,
        insertIndex: node.range[1] - 2,
        isStaticText,
        isStaticImage,
        isStaticClassName,
      })
    }

    // 递归遍历所有属性
    for (const key in node) {
      if (Object.hasOwn(node, key)) {
        const value = node[key]

        if (Array.isArray(value)) {
          value.forEach(walk)
        } else if (value && typeof value === 'object' && value.type) {
          walk(value)
        }
      }
    }
  }

  // 从根节点开始遍历
  walk(ast)

  return elements
}

exports.jsxCoordinates = jsxCoordinates
exports.findJSXElements = findJSXElements
module.exports = {
  jsxCoordinates,
  findJSXElements,
}
