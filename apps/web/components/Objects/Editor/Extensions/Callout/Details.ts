import { Node, mergeAttributes } from '@tiptap/core'

export const Details = Node.create({
  name: 'details',

  group: 'block',

  content: 'detailsSummary detailsContent',

  defining: true,

  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: element => element.hasAttribute('open'),
        renderHTML: attributes => {
          if (attributes.open) {
            return { open: '' }
          }
          return {}
        },
      },
    }
  },

  parseHTML() {
    return [
      { tag: 'details' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes, { class: 'editor-details border rounded-lg p-3 my-3 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800' }), 0]
  },
})

export const DetailsSummary = Node.create({
  name: 'detailsSummary',

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'summary' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes, { class: 'editor-summary font-semibold cursor-pointer outline-none select-none text-neutral-800 dark:text-neutral-200 hover:text-sky-600' }), 0]
  },
})

export const DetailsContent = Node.create({
  name: 'detailsContent',

  group: 'block',

  content: 'block+',

  parseHTML() {
    return [
      { tag: 'div[data-type="details-content"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'details-content', class: 'editor-details-content mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400' }), 0]
  },
})
