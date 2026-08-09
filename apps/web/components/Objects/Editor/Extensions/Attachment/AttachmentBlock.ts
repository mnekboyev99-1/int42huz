import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import dynamic from 'next/dynamic'

const AttachmentBlockComponent = dynamic(() => import('./AttachmentBlockComponent'), {
  ssr: false,
})

export default Node.create({
  name: 'blockAttachment',
  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      blockObject: {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'block-attachment',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['block-attachment', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AttachmentBlockComponent as any)
  },
})
