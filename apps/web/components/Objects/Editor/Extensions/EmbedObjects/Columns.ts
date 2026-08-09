import { Node, mergeAttributes } from '@tiptap/core'

export const Columns = Node.create({
  name: 'columns',

  group: 'block',

  content: 'column{2,3}', // supports 2 or 3 columns

  defining: true,

  parseHTML() {
    return [
      { tag: 'div[data-type="columns"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns', class: 'editor-columns flex flex-col md:flex-row gap-4 my-4 w-full' }), 0]
  },
})

export const Column = Node.create({
  name: 'column',

  group: 'block',

  content: 'block+',

  defining: true,

  parseHTML() {
    return [
      { tag: 'div[data-type="column"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'column', class: 'editor-column flex-1 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-3 min-h-[50px]' }), 0]
  },
})
