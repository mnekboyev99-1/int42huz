import { Extension } from '@tiptap/core'

export interface IndentOptions {
  types: string[]
  minIndent: number
  maxIndent: number
  indentSize: number
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    indent: {
      indent: () => ReturnType
      outdent: () => ReturnType
    }
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading', 'blockquote'],
      minIndent: 0,
      maxIndent: 10,
      indentSize: 24, // 24px per level
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: null,
            parseHTML: element => {
              const padding = element.style.paddingLeft
              if (!padding) return null
              const pixels = parseInt(padding, 10)
              return Math.round(pixels / this.options.indentSize) || null
            },
            renderHTML: attributes => {
              if (!attributes.indent) {
                return {}
              }
              return {
                style: `padding-left: ${attributes.indent * this.options.indentSize}px`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      indent: () => ({ commands }) => {
        return this.options.types.every(type => {
          return commands.updateAttributes(type, {
            indent: (oldIndent: number | null) => {
              const current = oldIndent || 0
              return current < this.options.maxIndent ? current + 1 : current
            },
          })
        })
      },
      outdent: () => ({ commands }) => {
        return this.options.types.every(type => {
          return commands.updateAttributes(type, {
            indent: (oldIndent: number | null) => {
              const current = oldIndent || 0
              return current > this.options.minIndent ? current - 1 : null
            },
          })
        })
      },
    }
  },
})

export default Indent
