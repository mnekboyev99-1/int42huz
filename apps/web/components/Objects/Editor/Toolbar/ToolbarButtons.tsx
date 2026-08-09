import { DividerVerticalIcon } from '@radix-ui/react-icons'
import {
  ArrowCounterClockwise,
  ArrowClockwise,
  ArrowsClockwise,
  BracketsCurly,
  CaretDown,
  CheckCircle,
  Code,
  Columns,
  ColumnsPlusRight,
  Cube,
  CursorClick,
  FileText,
  GitBranch,
  Globe,
  Headphones,
  Image as ImageIcon,
  ImagesSquare,
  Info,
  Lightbulb,
  Link,
  ListBullets,
  ListNumbers,
  Rows,
  RowsPlusBottom,
  SealQuestion,
  Sigma,
  Table,
  Tag,
  TextB,
  TextItalic,
  TextStrikethrough,
  TextUnderline,
  TextSubscript,
  TextSuperscript,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  Palette,
  Highlighter,
  Eraser,
  Minus,
  Quotes,
  User,
  VideoCamera,
  Warning,
  XCircle,
  TextIndent,
  TextOutdent,
  MagnifyingGlass,
  Sparkle,
} from '@phosphor-icons/react'
import { SiYoutube } from '@icons-pack/react-simple-icons'
import ToolTip from '@components/Objects/StyledElements/Tooltip/Tooltip'
import React from 'react'
import Image from 'next/image'
import LinkInputTooltip from './LinkInputTooltip'
import lrnaiIcon from 'public/lrnai_icon.png'
import { useOrg } from '@components/Contexts/OrgContext'
import { useTranslation } from 'react-i18next'
import { FontManagerModal } from './FontManagerModal'
import { SymbolsModal } from './SymbolsModal'
import { FindReplacePanel } from './FindReplacePanel'
import PDFImportModal from './PDFImportModal'

export const ToolbarButtons = React.memo(({ editor, props }: any) => {
  const { t } = useTranslation()
  const [showTableMenu, setShowTableMenu] = React.useState(false)
  const [showListMenu, setShowListMenu] = React.useState(false)
  const [showCodeMenu, setShowCodeMenu] = React.useState(false)
  const [showCalloutMenu, setShowCalloutMenu] = React.useState(false)
  const [showLinkInput, setShowLinkInput] = React.useState(false)
  const [showColorMenu, setShowColorMenu] = React.useState(false)
  const [showHighlightMenu, setShowHighlightMenu] = React.useState(false)
  const [isFontModalOpen, setIsFontModalOpen] = React.useState(false)
  const [isSymbolsModalOpen, setIsSymbolsModalOpen] = React.useState(false)
  const [isFindReplaceOpen, setIsFindReplaceOpen] = React.useState(false)
  const [isPDFImportOpen, setIsPDFImportOpen] = React.useState(false)
  const linkButtonRef = React.useRef<HTMLDivElement>(null)

  // Get AI feature from resolved_features
  const orgContext = useOrg() as any
  const rf = orgContext?.config?.config?.resolved_features
  const canUseAI = rf?.ai?.enabled === true

  if (!editor) {
    return null
  }


  const tableOptions = [
    {
      label: t('editor.toolbar.insert_table'),
      icon: <Table size={15} />,
      action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    },
    {
      label: t('editor.toolbar.add_row'),
      icon: <RowsPlusBottom size={15} />,
      action: () => editor.chain().focus().addRowAfter().run()
    },
    {
      label: t('editor.toolbar.add_column'),
      icon: <ColumnsPlusRight size={15} />,
      action: () => editor.chain().focus().addColumnAfter().run()
    },
    {
      label: t('editor.toolbar.delete_row'),
      icon: <Rows size={15} />,
      action: () => editor.chain().focus().deleteRow().run()
    },
    {
      label: t('editor.toolbar.delete_column'),
      icon: <Columns size={15} />,
      action: () => editor.chain().focus().deleteColumn().run()
    },
    {
      label: "Merge Cells",
      icon: <CheckCircle size={15} />,
      action: () => editor.chain().focus().mergeCells().run()
    },
    {
      label: "Split Cell",
      icon: <ArrowsClockwise size={15} />,
      action: () => editor.chain().focus().splitCell().run()
    },
    {
      label: "Cell Color (Yellow)",
      icon: <Palette size={15} style={{ color: '#fef9c3' }} />,
      action: () => editor.chain().focus().setCellAttribute('backgroundColor', '#fef9c3').run()
    },
    {
      label: "Cell Color (Green)",
      icon: <Palette size={15} style={{ color: '#dcfce7' }} />,
      action: () => editor.chain().focus().setCellAttribute('backgroundColor', '#dcfce7').run()
    },
    {
      label: "Cell Color (Blue)",
      icon: <Palette size={15} style={{ color: '#dbeafe' }} />,
      action: () => editor.chain().focus().setCellAttribute('backgroundColor', '#dbeafe').run()
    },
    {
      label: "Clear Cell Color",
      icon: <Eraser size={15} />,
      action: () => editor.chain().focus().setCellAttribute('backgroundColor', null).run()
    }
  ]

  const listOptions = [
    {
      label: t('editor.toolbar.bullet_list'),
      icon: <ListBullets size={15} />,
      action: () => {
        if (editor.isActive('bulletList')) {
          editor.chain().focus().toggleBulletList().run()
        } else {
          editor.chain().focus().toggleOrderedList().run()
          editor.chain().focus().toggleBulletList().run()
        }
      }
    },
    {
      label: t('editor.toolbar.ordered_list'),
      icon: <ListNumbers size={15} />,
      action: () => {
        if (editor.isActive('orderedList')) {
          editor.chain().focus().toggleOrderedList().run()
        } else {
          editor.chain().focus().toggleBulletList().run()
          editor.chain().focus().toggleOrderedList().run()
        }
      }
    }
  ]

  const handleLinkClick = () => {
    // Store the current selection
    const { from, to } = editor.state.selection

    if (editor.isActive('link')) {
      const currentLink = editor.getAttributes('link')
      setShowLinkInput(true)
    } else {
      setShowLinkInput(true)
    }

    // Restore the selection after a small delay to ensure the tooltip is rendered
    setTimeout(() => {
      editor.commands.setTextSelection({ from, to })
    }, 0)
  }

  const getCurrentLinkUrl = () => {
    if (editor.isActive('link')) {
      return editor.getAttributes('link').href
    }
    return ''
  }

  const handleLinkSave = (url: string) => {
    editor
      .chain()
      .focus()
      .setLink({
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer'
      })
      .run()
    setShowLinkInput(false)
  }

  const handleLinkCancel = () => {
    setShowLinkInput(false)
  }

  return (
    <div className="flex flex-row items-center justify-start flex-wrap gap-[7px] max-[1200px]:gap-[5px]">
      <div className="editor-tool-btn" onClick={() => editor.chain().focus().undo().run()} aria-label="Undo last action">
        <ArrowCounterClockwise size={15} />
      </div>
      <div className="editor-tool-btn" onClick={() => editor.chain().focus().redo().run()} aria-label="Redo last action">
        <ArrowClockwise size={15} />
      </div>
      <ToolTip content="Find and Replace">
        <div
          onClick={() => setIsFindReplaceOpen(!isFindReplaceOpen)}
          className={`editor-tool-btn ${isFindReplaceOpen ? 'is-active' : ''}`}
          aria-label="Find and Replace"
        >
          <MagnifyingGlass size={15} />
        </div>
      </ToolTip>
      {canUseAI && (
        <ToolTip content="AI PDF Importer">
          <div
            onClick={() => setIsPDFImportOpen(true)}
            className="editor-tool-btn border border-sky-100 dark:border-sky-900/30 text-sky-600 dark:text-sky-400 bg-sky-50/50 hover:bg-sky-50 dark:hover:bg-sky-950/20"
            aria-label="AI PDF Importer"
          >
            <Sparkle size={15} className="animate-pulse" />
          </div>
        </ToolTip>
      )}

      <DividerVerticalIcon style={{ color: 'grey', flexShrink: 0 }} />

      {/* Font Family */}
      <select
        className="editor-tool-select"
        style={{
          width: '120px',
          padding: '4px 8px',
          fontSize: '13px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          outline: 'none',
          backgroundColor: 'white',
          color: '#374151',
          cursor: 'pointer'
        }}
        value={(() => {
          const defaultFonts = ['Arial', 'Inter', 'Georgia', 'Times New Roman', 'Courier New', 'Comic Sans MS', 'Impact']
          for (const f of defaultFonts) {
            if (editor.isActive('textStyle', { fontFamily: f })) return f
          }
          const customFonts = orgContext?.config?.config?.customization?.general?.custom_fonts || orgContext?.config?.config?.custom_fonts || []
          if (Array.isArray(customFonts)) {
            for (const f of customFonts) {
              if (f?.name && editor.isActive('textStyle', { fontFamily: f.name })) return f.name
            }
          }
          return ''
        })()}
        onChange={(e) => {
          const val = e.target.value
          if (val === '__manage_fonts__') {
            setIsFontModalOpen(true)
            e.target.value = ''
            return
          }
          if (val === '') {
            editor.chain().focus().unsetFontFamily().run()
          } else {
            editor.chain().focus().setFontFamily(val).run()
          }
        }}
      >
        <option value="">{t('editor.toolbar.default_font') || 'Font'}</option>
        <option value="Arial">Arial</option>
        <option value="Inter">Inter</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Comic Sans MS">Comic Sans</option>
        <option value="Impact">Impact</option>
        
        {(() => {
          const customFonts = orgContext?.config?.config?.customization?.general?.custom_fonts || orgContext?.config?.config?.custom_fonts
          if (customFonts && Array.isArray(customFonts) && customFonts.length > 0) {
            return (
              <optgroup label="Custom Fonts">
                {customFonts.map((f: any) => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </optgroup>
            )
          }
          return null
        })()}
        <option value="__manage_fonts__" style={{ color: '#0284c7', fontWeight: 'bold' }}>+ Manage Fonts...</option>
      </select>

      {/* Font Size */}
      <select
        className="editor-tool-select"
        style={{
          width: '80px',
          padding: '4px 8px',
          fontSize: '13px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          outline: 'none',
          backgroundColor: 'white',
          color: '#374151',
          cursor: 'pointer'
        }}
        value={
          editor.getAttributes('textStyle').fontSize || ''
        }
        onChange={(e) => {
          const val = e.target.value
          if (val === '') {
            editor.chain().focus().unsetFontSize().run()
          } else {
            editor.chain().focus().setFontSize(val).run()
          }
        }}
      >
        <option value="">{t('editor.toolbar.default_size') || 'Size'}</option>
        <option value="12px">12px</option>
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
        <option value="30px">30px</option>
        <option value="36px">36px</option>
        <option value="48px">48px</option>
        <option value="60px">60px</option>
        <option value="72px">72px</option>
        <option value="84px">84px</option>
        <option value="96px">96px</option>
        <option value="100px">100px</option>
      </select>

      {/* Line Height */}
      <select
        className="editor-tool-select"
        style={{
          width: '65px',
          padding: '4px',
          fontSize: '13px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          outline: 'none',
          backgroundColor: 'white',
          color: '#374151',
          cursor: 'pointer'
        }}
        value={editor.getAttributes('paragraph').lineHeight || editor.getAttributes('heading').lineHeight || ''}
        onChange={(e) => {
          const val = e.target.value
          if (val === '') {
            editor.chain().focus().unsetLineHeight().run()
          } else {
            editor.chain().focus().setLineHeight(val).run()
          }
        }}
        title="Line Height"
      >
        <option value="">LH</option>
        <option value="1.0">1.0</option>
        <option value="1.15">1.15</option>
        <option value="1.2">1.2</option>
        <option value="1.5">1.5</option>
        <option value="1.8">1.8</option>
        <option value="2.0">2.0</option>
      </select>

      {/* Letter Spacing */}
      <select
        className="editor-tool-select"
        style={{
          width: '65px',
          padding: '4px',
          fontSize: '13px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          outline: 'none',
          backgroundColor: 'white',
          color: '#374151',
          cursor: 'pointer'
        }}
        value={editor.getAttributes('textStyle').letterSpacing || ''}
        onChange={(e) => {
          const val = e.target.value
          if (val === '') {
            editor.chain().focus().unsetLetterSpacing().run()
          } else {
            editor.chain().focus().setLetterSpacing(val).run()
          }
        }}
        title="Letter Spacing"
      >
        <option value="">LS</option>
        <option value="-0.05em">-0.05em</option>
        <option value="-0.02em">-0.02em</option>
        <option value="0em">0em</option>
        <option value="0.05em">0.05em</option>
        <option value="0.1em">0.1em</option>
        <option value="0.15em">0.15em</option>
        <option value="0.2em">0.2em</option>
      </select>

      <DividerVerticalIcon style={{ color: 'grey', flexShrink: 0 }} />

      <div
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`editor-tool-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        aria-label="Toggle bold formatting"
      >
        <TextB size={15} />
      </div>
      <div
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`editor-tool-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        aria-label="Toggle italic formatting"
      >
        <TextItalic size={15} />
      </div>
      <div
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`editor-tool-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
        aria-label="Toggle strikethrough formatting"
      >
        <TextStrikethrough size={15} />
      </div>
      <div
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`editor-tool-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
        aria-label="Toggle underline formatting"
      >
        <TextUnderline size={15} />
      </div>
      <div
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        className={`editor-tool-btn ${editor.isActive('subscript') ? 'is-active' : ''}`}
        aria-label="Subscript"
      >
        <TextSubscript size={15} />
      </div>
      <div
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        className={`editor-tool-btn ${editor.isActive('superscript') ? 'is-active' : ''}`}
        aria-label="Superscript"
      >
        <TextSuperscript size={15} />
      </div>

      <DividerVerticalIcon style={{ color: 'grey', flexShrink: 0 }} />

      {/* Color Dropdown */}
      <div className="relative inline-block shrink-0">
        <div
          onClick={() => {
            setShowColorMenu(!showColorMenu)
            setShowHighlightMenu(false)
          }}
          className={`editor-tool-btn ${showColorMenu ? 'is-active' : ''}`}
          aria-label="Text Color"
          title="Text Color"
        >
          <Palette size={15} />
          <CaretDown size={10} />
        </div>
        {showColorMenu && (
          <div className="editor-menu-dropdown grid grid-cols-5 gap-1 p-2" style={{ minWidth: '155px', zIndex: 100 }}>
            {[
              { color: '', label: 'Default', bg: '#ffffff', border: '#e5e7eb' },
              { color: '#8d78eb', label: 'Brand', bg: '#8d78eb' },
              { color: '#374151', label: 'Dark Gray', bg: '#374151' },
              { color: '#ef4444', label: 'Red', bg: '#ef4444' },
              { color: '#10b981', label: 'Green', bg: '#10b981' },
              { color: '#3b82f6', label: 'Blue', bg: '#3b82f6' },
              { color: '#f59e0b', label: 'Yellow', bg: '#f59e0b' },
              { color: '#8b5cf6', label: 'Purple', bg: '#8b5cf6' },
              { color: '#ec4899', label: 'Pink', bg: '#ec4899' },
              { color: '#6b7280', label: 'Gray', bg: '#6b7280' },
            ].map((c) => (
              <div
                key={c.color}
                onClick={() => {
                  if (c.color === '') {
                    editor.chain().focus().unsetColor().run()
                  } else {
                    editor.chain().focus().setColor(c.color).run()
                  }
                  setShowColorMenu(false)
                }}
                className="w-6 h-6 rounded-md cursor-pointer border hover:scale-110 transition-transform"
                style={{ backgroundColor: c.bg, borderColor: c.border || c.bg }}
                title={c.label}
              />
            ))}
            <div className="col-span-5 flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 w-full">
              <input
                type="color"
                onChange={(e) => {
                  editor.chain().focus().setColor(e.target.value).run()
                }}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                style={{ padding: 0, width: '24px', height: '24px' }}
                title="Choose custom color"
              />
              <input
                type="text"
                placeholder="#Hex"
                className="w-full px-1.5 py-0.5 text-[11px] rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-1 focus:ring-sky-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (/^#?[0-9a-fA-F]{3,8}$/.test(val)) {
                      const color = val.startsWith('#') ? val : `#${val}`
                      editor.chain().focus().setColor(color).run()
                      setShowColorMenu(false)
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Highlight Dropdown */}
      <div className="relative inline-block shrink-0">
        <div
          onClick={() => {
            setShowHighlightMenu(!showHighlightMenu)
            setShowColorMenu(false)
          }}
          className={`editor-tool-btn ${showHighlightMenu ? 'is-active' : ''}`}
          aria-label="Text Highlight"
          title="Text Highlight"
        >
          <Highlighter size={15} />
          <CaretDown size={10} />
        </div>
        {showHighlightMenu && (
          <div className="editor-menu-dropdown grid grid-cols-6 gap-1 p-2" style={{ minWidth: '185px', zIndex: 100 }}>
            {[
              { color: '', label: 'None', bg: '#ffffff', border: '#e5e7eb' },
              { color: '#fde047', label: 'Yellow', bg: '#fde047' },
              { color: '#86efac', label: 'Green', bg: '#86efac' },
              { color: '#93c5fd', label: 'Blue', bg: '#93c5fd' },
              { color: '#fbcfe8', label: 'Pink', bg: '#fbcfe8' },
              { color: '#e5e7eb', label: 'Gray', bg: '#e5e7eb' },
              { color: '#fed7aa', label: 'Orange', bg: '#fed7aa' },
              { color: '#e9d5ff', label: 'Purple', bg: '#e9d5ff' },
              { color: '#fca5a5', label: 'Red', bg: '#fca5a5' },
              { color: '#99f6e4', label: 'Teal', bg: '#99f6e4' },
              { color: '#c7d2fe', label: 'Indigo', bg: '#c7d2fe' },
            ].map((c) => (
              <div
                key={c.color}
                onClick={() => {
                  if (c.color === '') {
                    editor.chain().focus().unsetHighlight().run()
                  } else {
                    editor.chain().focus().setHighlight({ color: c.color }).run()
                  }
                  setShowHighlightMenu(false)
                }}
                className="w-6 h-6 rounded-md cursor-pointer border hover:scale-110 transition-transform"
                style={{ backgroundColor: c.bg, borderColor: c.border || c.bg }}
                title={c.label}
              />
            ))}
            <div className="col-span-6 flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-neutral-100 dark:border-neutral-800 w-full">
              <input
                type="color"
                onChange={(e) => {
                  editor.chain().focus().setHighlight({ color: e.target.value }).run()
                }}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                style={{ padding: 0, width: '24px', height: '24px' }}
                title="Choose custom highlight color"
              />
              <input
                type="text"
                placeholder="#Hex"
                className="w-full px-1.5 py-0.5 text-[11px] rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white outline-none focus:ring-1 focus:ring-sky-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (/^#?[0-9a-fA-F]{3,8}$/.test(val)) {
                      const color = val.startsWith('#') ? val : `#${val}`
                      editor.chain().focus().setHighlight({ color }).run()
                      setShowHighlightMenu(false)
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      <DividerVerticalIcon style={{ color: 'grey', flexShrink: 0 }} />

      {/* Text Alignment */}
      <div
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`editor-tool-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`}
        aria-label="Align Left"
        title="Align Left"
      >
        <TextAlignLeft size={15} />
      </div>
      <div
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`editor-tool-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`}
        aria-label="Align Center"
        title="Align Center"
      >
        <TextAlignCenter size={15} />
      </div>
      <div
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`editor-tool-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`}
        aria-label="Align Right"
        title="Align Right"
      >
        <TextAlignRight size={15} />
      </div>
      <div
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`editor-tool-btn ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`}
        aria-label="Align Justify"
        title="Align Justify"
      >
        <TextAlignJustify size={15} />
      </div>

      <ToolTip content="Outdent (Tab left)">
        <div
          onClick={() => editor.chain().focus().outdent().run()}
          className="editor-tool-btn"
          aria-label="Outdent"
        >
          <TextOutdent size={15} />
        </div>
      </ToolTip>
      <ToolTip content="Indent (Tab right)">
        <div
          onClick={() => editor.chain().focus().indent().run()}
          className="editor-tool-btn"
          aria-label="Indent"
        >
          <TextIndent size={15} />
        </div>
      </ToolTip>

      <DividerVerticalIcon style={{ color: 'grey', flexShrink: 0 }} />

      {/* Quotes, Horizontal Rule, Clear Formatting */}
      <div
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`editor-tool-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        aria-label="Blockquote"
        title="Blockquote"
      >
        <Quotes size={15} weight="fill" />
      </div>
      <div
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="editor-tool-btn"
        aria-label="Horizontal Rule"
        title="Horizontal Rule"
      >
        <Minus size={15} />
      </div>
      <div
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="editor-tool-btn"
        aria-label="Clear Formatting"
        title="Clear Formatting"
      >
        <Eraser size={15} />
      </div>

      <DividerVerticalIcon style={{ color: 'grey', flexShrink: 0 }} />
      <div className="relative inline-block shrink-0">
        <div
          onClick={() => setShowListMenu(!showListMenu)}
          className={`editor-tool-btn ${showListMenu || editor.isActive('bulletList') || editor.isActive('orderedList') ? 'is-active' : ''}`}
          aria-label="Insert list"
        >
          <ListBullets size={15} />
          <CaretDown size={10} />
        </div>
        {showListMenu && (
          <div className="editor-menu-dropdown">
            {listOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  option.action()
                  setShowListMenu(false)
                }}
                className={`editor-menu-item ${editor.isActive(index === 0 ? 'bulletList' : 'orderedList') ? 'is-active' : ''}`}
              >
                <span className="icon">{option.icon}</span>
                <span className="label">{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <select
        className="editor-tool-select"
        value={
          editor.isActive('heading', { level: 1 }) ? "1" :
          editor.isActive('heading', { level: 2 }) ? "2" :
          editor.isActive('heading', { level: 3 }) ? "3" :
          editor.isActive('heading', { level: 4 }) ? "4" :
          editor.isActive('heading', { level: 5 }) ? "5" :
          editor.isActive('heading', { level: 6 }) ? "6" : "0"
        }
        onChange={(e) => {
          const value = e.target.value;
          if (value === "0") {
            editor.chain().focus().setParagraph().run();
          } else {
            editor.chain().focus().toggleHeading({ level: parseInt(value) }).run();
          }
        }}
      >
        <option value="0">{t('editor.toolbar.paragraph')}</option>
        <option value="1">{t('editor.toolbar.heading1')}</option>
        <option value="2">{t('editor.toolbar.heading2')}</option>
        <option value="3">{t('editor.toolbar.heading3')}</option>
        <option value="4">{t('editor.toolbar.heading4')}</option>
        <option value="5">{t('editor.toolbar.heading5')}</option>
        <option value="6">{t('editor.toolbar.heading6')}</option>
      </select>
      <div className="relative inline-block shrink-0">
        <div
          onClick={() => setShowTableMenu(!showTableMenu)}
          className={`editor-tool-btn ${showTableMenu ? 'is-active' : ''}`}
          aria-label="Insert table"
        >
          <Table size={15} />
          <CaretDown size={10} />
        </div>
        {showTableMenu && (
          <div className="editor-menu-dropdown">
            {tableOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => {
                  option.action()
                  setShowTableMenu(false)
                }}
                className="editor-menu-item"
              >
                <span className="icon">{option.icon}</span>
                <span className="label">{option.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <DividerVerticalIcon
        style={{ marginTop: 'auto', marginBottom: 'auto', color: 'grey' }}
      />
      <div className="relative inline-block shrink-0">
        <div
          onClick={() => setShowCalloutMenu(!showCalloutMenu)}
          className={`editor-tool-btn editor-tool-btn-info ${
            showCalloutMenu ||
            editor.isActive('callout') ||
            editor.isActive('calloutInfo') ||
            editor.isActive('calloutWarning')
              ? 'is-active'
              : ''
          }`}
          aria-label="Callout"
        >
          <Info size={15} />
          <CaretDown size={10} />
        </div>
        {showCalloutMenu && (
          <div className="editor-menu-dropdown">
            {[
              { type: 'info',    label: 'Info',    icon: <Info      size={14} weight="fill" />, style: 'text-gray-500'   },
              { type: 'warning', label: 'Warning', icon: <Warning   size={14} weight="fill" />, style: 'text-yellow-500' },
              { type: 'tip',     label: 'Tip',     icon: <Lightbulb size={14} weight="fill" />, style: 'text-green-500'  },
              { type: 'success', label: 'Success', icon: <CheckCircle size={14} weight="fill" />, style: 'text-teal-500' },
              { type: 'error',   label: 'Error',   icon: <XCircle   size={14} weight="fill" />, style: 'text-red-500'   },
            ].map(({ type, label, icon, style }) => (
              <div
                key={type}
                onClick={() => {
                  editor.chain().focus().insertContent({
                    type: 'callout',
                    attrs: { type },
                    content: [],
                  }).run()
                  setShowCalloutMenu(false)
                }}
                className="editor-menu-item"
              >
                <span className={`icon ${style}`}>{icon}</span>
                <span className="label">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToolTip content={t('editor.toolbar.link')}>
        <div style={{ position: 'relative' }}>
          <div
            ref={linkButtonRef}
            onClick={handleLinkClick}
            className={`editor-tool-btn editor-tool-btn-link ${editor.isActive('link') ? 'is-active' : ''}`}
            aria-label={t('editor.toolbar.link')}
          >
            <Link size={15} />
          </div>
          {showLinkInput && (
            <LinkInputTooltip
              onSave={handleLinkSave}
              onCancel={handleLinkCancel}
              currentUrl={getCurrentLinkUrl()}
            />
          )}
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.image')}>
        <div
          className="editor-tool-btn editor-tool-btn-media"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'blockImage',
              })
              .run()
          }
          aria-label={t('editor.blocks.image')}
        >
          <ImageIcon size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Slayder">
        <div
          className="editor-tool-btn editor-tool-btn-media"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'blockSlider',
              })
              .run()
          }
          aria-label="Slayder"
        >
          <ImagesSquare size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.video')}>
        <div
          className="editor-tool-btn editor-tool-btn-media"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'blockVideo',
              })
              .run()
          }
          aria-label={t('editor.blocks.video')}
        >
          <VideoCamera size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Audio">
        <div
          className="editor-tool-btn editor-tool-btn-media"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'blockAudio',
              })
              .run()
          }
          aria-label="Audio"
        >
          <Headphones size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.youtube')}>
        <div className="editor-tool-btn editor-tool-btn-media" onClick={() => editor.chain().focus().insertContent({ type: 'blockEmbed' }).run()} aria-label={t('editor.blocks.youtube')}>
          <SiYoutube size={15} />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.math')}>
        <div
          className="editor-tool-btn editor-tool-btn-math"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'blockMathEquation',
              })
              .run()
          }
          aria-label={t('editor.blocks.math')}
        >
          <Sigma size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.pdf')}>
        <div
          className="editor-tool-btn editor-tool-btn-document"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'blockPDF',
              })
              .run()
          }
          aria-label={t('editor.blocks.pdf')}
        >
          <FileText size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.quiz')}>
        <div
          className="editor-tool-btn editor-tool-btn-interactive"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertContent({
                type: 'blockQuiz',
              })
              .run()
          }
          aria-label={t('editor.blocks.quiz')}
        >
          <SealQuestion size={15} weight="fill" />
        </div>
      </ToolTip>
      <div className="relative inline-block shrink-0">
        <div
          onClick={() => setShowCodeMenu(!showCodeMenu)}
          className={`editor-tool-btn editor-tool-btn-code ${showCodeMenu || editor.isActive('codeBlock') || editor.isActive('blockCode') ? 'is-active' : ''}`}
          aria-label={t('editor.toolbar.code_block')}
        >
          <Code size={15} weight="fill" />
          <CaretDown size={10} />
        </div>
        {showCodeMenu && (
          <div className="editor-menu-dropdown">
            <div
              onClick={() => {
                editor.chain().focus().toggleCodeBlock().run()
                setShowCodeMenu(false)
              }}
              className={`editor-menu-item ${editor.isActive('codeBlock') ? 'is-active' : ''}`}
            >
              <span className="icon"><Code size={15} weight="fill" /></span>
              <span className="label">Basic</span>
            </div>
            <div
              onClick={() => {
                editor.chain().focus().insertContent({
                  type: 'blockCode',
                  attrs: {
                    mode: 'advanced',
                    languageId: 71,
                    languageName: 'Python 3',
                    starterCode: '# Write your code here\n',
                    testCases: [],
                  },
                }).run()
                setShowCodeMenu(false)
              }}
              className="editor-menu-item"
            >
              <span className="icon"><BracketsCurly size={15} weight="fill" /></span>
              <span className="label">Playground</span>
            </div>
          </div>
        )}
      </div>
      <ToolTip content={t('editor.blocks.embed')}>
        <div
          className="editor-tool-btn editor-tool-btn-embed"
          onClick={() => editor.chain().focus().insertContent({ type: 'blockEmbed' }).run()}
          aria-label={t('editor.blocks.embed')}
        >
          <Cube size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.badge')}>
        <div
          className="editor-tool-btn editor-tool-btn-badge"
          onClick={() => editor.chain().focus().insertContent({
            type: 'badge',
            content: [
              {
                type: 'text',
                text: 'Badge'
              }
            ]
          }).run()}
          aria-label={t('editor.blocks.badge')}
        >
          <Tag size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.button')}>
        <div
          className="editor-tool-btn editor-tool-btn-interactive"
          onClick={() => editor.chain().focus().insertContent({
            type: 'button',
            content: [
              {
                type: 'text',
                text: 'Button'
              }
            ]
          }).run()}
          aria-label={t('editor.blocks.button')}
        >
          <CursorClick size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.user')}>
        <div
          className="editor-tool-btn editor-tool-btn-user"
          onClick={() => editor.chain().focus().insertContent({ type: 'blockUser' }).run()}
          aria-label={t('editor.blocks.user')}
        >
          <User size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.web_preview')}>
        <div
          className="editor-tool-btn editor-tool-btn-web"
          onClick={() =>
            editor.chain().focus().insertContent({
              type: 'blockWebPreview',
            }).run()
          }
          aria-label={t('editor.blocks.web_preview')}
        >
          <Globe size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.flipcard')}>
        <div
          className="editor-tool-btn editor-tool-btn-interactive"
          onClick={() =>
            editor.chain().focus().insertContent({
              type: 'flipcard',
              attrs: {
                question: 'Click to reveal the answer',
                answer: 'This is the answer',
                color: 'blue',
                alignment: 'center',
                size: 'medium'
              }
            }).run()
          }
          aria-label={t('editor.blocks.flipcard')}
        >
          <ArrowsClockwise size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={t('editor.blocks.scenario')}>
        <div
          className="editor-tool-btn editor-tool-btn-interactive"
          onClick={() =>
            editor.chain().focus().insertContent({
              type: 'scenarios',
              attrs: {
                title: 'Interactive Scenario',
                scenarios: [
                  {
                    id: '1',
                    text: 'Welcome to this interactive scenario. What would you like to do?',
                    imageUrl: '',
                    options: [
                      { id: 'opt1', text: 'Continue exploring', nextScenarioId: '2' },
                      { id: 'opt2', text: 'Learn more about the topic', nextScenarioId: '3' }
                    ]
                  },
                  {
                    id: '2',
                    text: 'Great choice! You are now exploring further. What\'s your next step?',
                    imageUrl: '',
                    options: [
                      { id: 'opt3', text: 'Go back to start', nextScenarioId: '1' },
                      { id: 'opt4', text: 'Finish scenario', nextScenarioId: null }
                    ]
                  },
                  {
                    id: '3',
                    text: 'Here\'s more information about the topic. This helps you understand better.',
                    imageUrl: '',
                    options: [
                      { id: 'opt5', text: 'Go back to start', nextScenarioId: '1' },
                      { id: 'opt6', text: 'Finish scenario', nextScenarioId: null }
                    ]
                  }
                ],
                currentScenarioId: '1'
              }
            }).run()
          }
          aria-label={t('editor.blocks.scenario')}
        >
          <GitBranch size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content={canUseAI ? t('editor.blocks.magic_block') : t('editor.blocks.magic_block_disabled')}>
        {canUseAI ? (
          <div
            className="editor-tool-btn editor-tool-btn-magic"
            onClick={() =>
              editor.chain().focus().insertContent({
                type: 'blockMagic',
              }).run()
            }
            aria-label={t('editor.blocks.magic_block')}
          >
            <Image src={lrnaiIcon} alt="Magic Block" width={15} height={15} />
          </div>
        ) : (
          <div className="editor-tool-btn editor-tool-btn-magic editor-tool-btn-magic-disabled" aria-label={t('editor.blocks.magic_block_disabled')}>
            <Image src={lrnaiIcon} alt="Magic Block" width={15} height={15} />
          </div>
        )}
      </ToolTip>

      <ToolTip content="Columns Layout">
        <div
          className="editor-tool-btn editor-tool-btn-embed"
          onClick={() => editor.chain().focus().insertContent({
            type: 'columns',
            content: [
              { type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Column 1' }] }] },
              { type: 'column', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Column 2' }] }] }
            ]
          }).run()}
          aria-label="Columns Layout"
        >
          <Columns size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Toggle List (Accordion)">
        <div
          className="editor-tool-btn editor-tool-btn-info"
          onClick={() => editor.chain().focus().insertContent({
            type: 'details',
            content: [
              { type: 'detailsSummary', content: [{ type: 'text', text: 'Toggle List Title' }] },
              { type: 'detailsContent', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested contents go here...' }] }] }
            ]
          }).run()}
          aria-label="Toggle List"
        >
          <Rows size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Special Characters & Symbols">
        <div
          className="editor-tool-btn editor-tool-btn-interactive"
          onClick={() => setIsSymbolsModalOpen(true)}
          aria-label="Special Symbols"
        >
          <span className="font-bold text-xs">Ω</span>
        </div>
      </ToolTip>

      {/* Modals & Panels */}
      <FontManagerModal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
      />
      <SymbolsModal
        isOpen={isSymbolsModalOpen}
        onClose={() => setIsSymbolsModalOpen(false)}
        onSelectSymbol={(symbol) => {
          editor.chain().focus().insertContent(symbol).run()
        }}
      />
      <FindReplacePanel
        editor={editor}
        isOpen={isFindReplaceOpen}
        onClose={() => setIsFindReplaceOpen(false)}
      />
      <PDFImportModal
        isOpen={isPDFImportOpen}
        onClose={() => setIsPDFImportOpen(false)}
        editor={editor}
        activityUuid={props?.activity?.activity_uuid || ''}
      />
    </div>
  )
})
