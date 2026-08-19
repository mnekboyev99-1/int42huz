# Int42h 🎓

<div align="center">
  <h3>Modern Interactive Learning Management System & Educational Platform</h3>
  <p>An intuitive, interactive, and scalable platform empowering educators and students with modern course building, real-time collaboration, and AI-assisted learning.</p>

  <p>
    <a href="https://int42h.uz" target="_blank">
      <img src="https://img.shields.io/badge/Live%20Demo-int42h.uz-blue?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-6.0-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  </p>
</div>

---

## 🌐 Live Demo & Original Platform

You can explore the live, fully functional platform directly without local setup requirements:

👉 **[https://int42h.uz](https://int42h.uz)**

*Explore public courses, learning materials, and platform experiences live without mandatory login credentials.*

---

## 🚀 About Int42h

**Int42h** is a next-generation educational platform built to bridge the gap between traditional learning management systems and modern interactive tools. It offers educators a modular block-based course creator, AI-powered tutoring capabilities, real-time collaborative whiteboards, and robust analytics — all wrapped in an ultra-responsive, sleek user interface.

This repository contains the **Frontend Web Application (`apps/web`)** prepared for jury review and public MVP demonstration.

---

## 🌟 Key Features

- 📝 **Advanced Block-Based Editor**: Dynamic rich-text and media editing powered by TipTap with support for code playgrounds, KaTeX mathematical formulas, image cropping/transformation, YouTube embeds, attachments, and callout blocks.
- 📚 **Comprehensive Course Management**: Modular courses, chapters, interactive activities, SCORM compliance, dynamic quizzes, and automated certificate generation.
- 🧠 **AI-Powered Learning Assistant**: Built-in AI Copilot to generate lesson outlines, suggest knowledge-check quizzes, and assist students with interactive question answering.
- 🎨 **Whiteboard & Collaborative Canvas**: Real-time collaborative workspace for interactive drawings, diagramming, and brainstorm sessions powered by CRDTs (Yjs).
- 📊 **Learner Analytics & Insights**: Deep engagement metrics, assignment tracking, submission grading, and real-time progress indicators.
- 🌐 **Comprehensive Multilingual Support (i18n)**: Native localization supporting Uzbek (`uz`), English (`en`), Russian (`ru`), and 15+ additional languages.
- 👥 **Role-Based Access & Multi-Tenancy**: Organization and workspace management with fine-grained permission control.

---

## 🛠️ Technology Stack

### Frontend (`apps/web`)
* **Framework:** [Next.js 16 (Turbopack, App Router)](https://nextjs.org/)
* **Library:** [React 19](https://react.dev/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Styling:** [TailwindCSS v4](https://tailwindcss.com/) & Vanilla CSS modules
* **Rich Text & Content Editor:** [TipTap](https://tiptap.dev/) & [CodeMirror](https://codemirror.net/)
* **State & Data Fetching:** [SWR](https://swr.vercel.app/)
* **Icons & Animation:** [Lucide Icons](https://lucide.dev/), [Phosphor Icons](https://phosphoricons.com/), [Motion (Framer Motion)](https://motion.dev/)

### Backend & Infrastructure (Production System)
* **Backend:** FastAPI (Python), SQLAlchemy, Alembic
* **Database & Cache:** PostgreSQL, Redis
* **Real-time Sync:** WebSockets, Yjs CRDTs
* **Containerization:** Docker & Docker Compose

---

## 💻 Getting Started (Local Development)

To run the frontend web application locally:

### 1. Clone the repository
```bash
git clone https://github.com/mnekboyev99-1/int42huz.git
cd int42huz/apps/web
```

### 2. Install dependencies
Using **npm**:
```bash
npm install
```
*Or using **bun** / **yarn** / **pnpm**:*
```bash
bun install
# or: yarn install
# or: pnpm install
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Open in browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📂 Project Structure

```text
int42huz/
├── apps/
│   └── web/                   # Next.js Frontend Application
│       ├── app/               # Next.js App Router (Routes & Layouts)
│       │   ├── auth/          # Authentication flows (Login, Signup, Reset)
│       │   ├── editor/        # Course and Activity Block Editor
│       │   ├── orgs/          # Organization Dashboards & Learning Portals
│       │   ├── board/         # Collaborative Whiteboard Canvas
│       │   └── home/          # Landing and Welcome Pages
│       ├── components/        # Reusable UI & Business Logic Components
│       │   ├── Dashboard/     # Management & Analytics Dashboards
│       │   ├── Objects/       # Editor Blocks, Media Players, Modals
│       │   └── Contexts/      # React Context Providers
│       ├── locales/           # Localization translations (uz, en, ru, etc.)
│       ├── services/          # API Services & Configurations
│       └── public/            # Static Assets, Icons & Brand Logos
├── docs/                      # Documentation
└── README.md                  # Project Overview
```

---

## 🔗 Useful Links

* **Live Platform:** [https://int42h.uz](https://int42h.uz)
* **Documentation:** [https://docs.int42h.uz](https://docs.int42h.uz)
* **GitHub Repository:** [https://github.com/mnekboyev99-1/int42huz](https://github.com/mnekboyev99-1/int42huz)

---

## 📄 License

This project is licensed under the terms described in the [LICENSE](LICENSE) file.
