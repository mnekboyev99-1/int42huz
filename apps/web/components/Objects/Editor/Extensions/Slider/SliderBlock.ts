import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import dynamic from 'next/dynamic'

const SliderBlockComponent = dynamic(() => import('./SliderBlockComponent'), {
  ssr: false,
})

export default Node.create({
  name: 'blockSlider',
  group: 'block',
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      slides: {
        default: [],
      },
      alignment: {
        default: 'center',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'block-slider',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['block-slider', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SliderBlockComponent as any)
  },
})
