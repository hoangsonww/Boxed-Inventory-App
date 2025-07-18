# 📦 **Boxed - Your Smart Home Inventory, Packing & Retrieval Assistant**

**Boxed** helps you *actually know* where your stuff is. Create boxes, drop items in, add photos, tag types, collaborators, mark packed status, search instantly – then ask **BoxedAI** *“Where’s my winter jacket?”* and get an answer sourced from your real inventory.

**Think “Notion for your physical belongings” with an AI locator + packing coach.**

<p align="center">
  <img src="docs/logo.png" alt="Boxed Cover" width="45%" style="border-radius:12px" />
</p>

> [!IMPORTANT]
> Born out of the frustration of moving & forgetting which box had **that one cable**. Now, **Boxed** keeps every item queryable & context‑aware.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square\&logo=typescript\&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square\&logo=nextdotjs\&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square\&logo=react\&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square\&logo=supabase\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square\&logo=postgresql\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square\&logo=tailwindcss\&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-889889?style=flat-square)
![Dnd Kit](https://img.shields.io/badge/DnD_Kit-000?style=flat-square)
![Lucide](https://img.shields.io/badge/Lucide-18181B?style=flat-square)
![Google AI](https://img.shields.io/badge/Google_Gemini-4285F4?style=flat-square\&logo=google\&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3068B7?style=flat-square)
![Day.js](https://img.shields.io/badge/Day.js-FF5D01?style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square\&logo=framer\&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=flat-square\&logo=eslint\&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square\&logo=prettier\&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square\&logo=vercel\&logoColor=white)

---

## 📑 Table of Contents

1. [About Boxed](#-about-boxed)
2. [Core Features](#-core-features)
3. [BoxedAI (Gemini‑Powered)](#-boxedai-gemini-powered)
4. [Tech Stack](#-tech-stack)
5. [UI / UX Highlights](#-ui--ux-highlights)
6. [Data Model](#-data-model)
7. [Inventory Context Generation](#-inventory-context-generation)
8. [Getting Started](#-getting-started)
9. [Environment Variables](#-environment-variables)
10. [Development Scripts](#-development-scripts)
11. [CSV Export Format](#-csv-export-format)
12. [Security & Constraints](#-security--constraints)
13. [Roadmap](#-roadmap)
14. [Contributing](#-contributing)
15. [License](#-license)
16. [Author](#-author)

---

## 🪄 About Boxed

Boxed is a **personal / household inventory & packing assistant** built on top of Supabase (auth, Postgres, storage) + a modern Next.js frontend.
It aims to eliminate: *“Which box has the charger?”*, *“Did I already pack those mugs?”*, *“Where did I put winter clothes?”*.

Use it while:

* Moving apartments
* Seasonal storage (winter vs. summer)
* Gear management (photography, hobby, tools)
* Shared spaces (roommates / family / team kit)

All these features are designed to make the lives of movers, families, and especially college students easier, as I have been there myself - I often lost track of my belongings during moves and relocations, and I wish I had a tool like Boxed back then...

Boxed is built with a focus on **simplicity**, **usability**, and **AI-powered assistance** to help you find and pack your items efficiently.

---

## ✨ Core Features

| Category           | Features                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Boxes**          | Create, rename inline, photo (upload/change/remove), set location, status (`packed` / `unpacked`), drag-to-reorder persistently |
| **Items**          | Add per box, quantity, optional photo, type classification, edit inline via modal (name/qty/photo)                              |
| **Types**          | Item types (e.g. *Clothing, Cables, Kitchen*) with pill color cycling                                                           |
| **Collaborators**  | Share access (data model prepared with `box_collaborators`)                                                                     |
| **Search**         | Debounced global item search with box context + empty & loading states                                                          |
| **Inline Editing** | Box name & location directly editable (shadcn + custom EditableText)                                                            |
| **Status Toggle**  | “Mark Packed / Mark Unpacked” pill-driven action                                                                                |
| **Photos**         | Box & item image storage via Supabase buckets                                                                                   |
| **Export**         | One-click export of all boxes + items → CSV (flattened rows)                                                                    |
| **Responsive Nav** | Collapses gracefully; spacing optimized for small screens                                                                       |
| **Tooltips**       | For destructive actions (e.g. remove photo)                                                                                     |
| **Dark / Light**   | Theme toggle integrated with tokenized OKLCH palette                                                                            |
| **Persistence**    | Drag order per user stored in `localStorage`                                                                                    |
| **Performance**    | Prompt-limited context generation, truncated lists for AI context                                                               |
| **AI Assistant**   | *BoxedAI* chat bubble → inventory-aware retrieval & packing guidance                                                            |

---

## 🤖 BoxedAI (Gemini‑Powered)

| Capability              | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| **Item Locator**        | “Where is my HDMI cable?”, “Which box has ceramic mugs?”                  |
| **Packing Tips**        | Suggests categorization, padding, consolidation ideas                     |
| **Context Awareness**   | Receives summarized + truncated inventory (boxes + items + collaborators) |
| **Clarification**       | If ambiguous or missing, asks follow-ups (instructed not to hallucinate)  |
| **Language Matching**   | Replies in same language as user input                                    |
| **Lightweight Session** | Frontend builds `history` array & sends to Gemini with system instruction |

**Prompt Guardrails**: No fabrication, mention only real boxes & items, encourage explicit names.

---

## 🧱 Tech Stack

| Layer                   | Stack                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| **Frontend**            | Next.js (App/Pages hybrid depending), React 18, TypeScript             |
| **Styling**             | Tailwind CSS, shadcn/ui component primitives                           |
| **State / UX**          | Local state hooks, dnd-kit for box reordering, dayjs for relative time |
| **Backend (Managed)**   | Supabase: Auth, Postgres, Storage, Row-level queries                   |
| **AI**                  | Google Generative AI (Gemini `gemini-1.5-flash` or variant)            |
| **Validation**          | Zod schemas for box/item/type parsing                                  |
| **Icons**               | Lucide-react                                                           |
| **MD Rendering**        | react-markdown + remark-gfm (chat responses)                           |
| **Animations (select)** | Framer Motion (earlier draggable variant) / CSS transitions            |
| **Build & Deploy**      | Vercel (web) + Supabase managed infra                                  |

---

## 🖥 UI / UX Highlights

* **Inventory Dashboard**: Drag re-order with handle hover (opacity reveal) – persists user order client-side.
* **Box Hero Header**: Gradient overlay + inline editable text + status pill + photo controls + tooltip for destructive photo removal.
* **ItemCard**: Photo / placeholder, quantity, relative “last used”, type pill, bottom-right edit pencil leading to modal.
* **Item Edit Modal**: Name / quantity / photo choose → upload to bucket → optimistic closure.
* **Chat Button**: Fixed mid-left, minimal friction; opens AI Dialog (shadcn `Dialog`).
* **Chat Dialog**: ScrollArea, Markdown bubbles, shift+enter newline, Enter send, inventory loading indicator.
* **Export CSV**: Flattened structure ready for spreadsheets or offline backup.

---

## 🗄 Data Model

> Simplified conceptual tables (Supabase Postgres)

| Table                       | Key Fields                                                                                                           | Notes                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `profiles`                  | `id (uuid PK)`, `full_name`, `avatar_url`                                                                            | Supabase auth metadata (implicit) |
| `boxes`                     | `id uuid PK`, `owner_profile_id FK`, `name`, `location`, `status (packed/unpacked)`, `photo_url`, `created_at`       | Core container                    |
| `items`                     | `id uuid PK`, `box_id FK`, `type_id FK?`, `name`, `quantity int`, `photo_url`, `last_used (timestamp)`, `created_at` | Belongs to a box                  |
| `item_types`                | `id serial PK`, `name`                                                                                               | For classification pills          |
| `box_collaborators`         | `box_id FK`, `collaborator_profile_id FK`, `role`                                                                    | Multi-user future features        |
| *(optional)* `activity_log` | `id`, `actor_id`, `entity_type`, `entity_id`, `action`, `ts`                                                         | For future auditing               |

**Indexes you should have (recommended):**

```sql
CREATE INDEX ON boxes (owner_profile_id);
CREATE INDEX ON items (box_id);
CREATE INDEX ON items (name text_pattern_ops);
CREATE INDEX ON items (type_id);
CREATE INDEX ON box_collaborators (box_id);
```

---

## 🧬 Inventory Context Generation

The AI context builder:

1. Fetches **all boxes** owned by user.
2. Fetches **all items** for these boxes (batched).
3. Fetches **collaborators** (optional).
4. Truncates: max 30 boxes; max 25 items per box.
5. Produces summary lines like:

   ```
   Box: "Kitchen Essentials" (id:abc) status:packed loc:Pantry items:5 => Plates (qty 8), Glasses (qty 6), ...
   ```
6. Caches (`localStorage`) for 60s to avoid re-pulling on every chat open.
7. Supplies to Gemini system instruction: no hallucination, clarification if missing.

---

## 🚀 Getting Started

```bash
git clone https://github.com/your-user/boxed.git
cd boxed

# 1. Install deps
pnpm install   # or npm i / yarn

# 2. Env
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_GOOGLE_AI_API_KEY

# 3. Run Dev
pnpm dev
# -> http://localhost:3000

# 4. Supabase (if local)
# Use Supabase CLI (optional):
supabase start
```

> \[!NOTE]
> If using hosted Supabase dashboard, just paste URL + anon key in env file and skip local CLI.

---

## 🔐 Environment Variables

| Var                             | Required        | Description                                |
| ------------------------------- | --------------- | ------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✅               | Supabase project URL                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅               | Public anon key                            |
| `NEXT_PUBLIC_GOOGLE_AI_API_KEY` | ✅               | Google Gemini API key                      |
| `SUPABASE_SERVICE_ROLE_KEY`     | ❌ (server only) | For server-side maintenance tasks          |
| `NEXT_PUBLIC_APP_NAME`          | ❌               | Branding override                          |
| `NEXT_PUBLIC_DEBUG_AI`          | ❌               | If `1`, console logs AI context (dev only) |

---

## 🧪 Development Scripts

| Script      | Purpose                     |
| ----------- | --------------------------- |
| `dev`       | Run Next.js locally         |
| `build`     | Production build            |
| `start`     | Start production server     |
| `lint`      | ESLint                      |
| `typecheck` | TS project references check |
| `format`    | Prettier write              |

*(Adjust depending on your actual `package.json`.)*

---

## 📤 CSV Export Format

Each row = one (box, item?) pair. Empty item columns if box has no items.

| Column           | Example                         |
| ---------------- | ------------------------------- |
| `box_id`         | `a8f9c8d1-...`                  |
| `box_name`       | `Kitchen Essentials`            |
| `box_location`   | `Pantry`                        |
| `box_status`     | `packed`                        |
| `item_id`        | `f23f...` or empty              |
| `item_name`      | `Ceramic Mug`                   |
| `item_quantity`  | `6`                             |
| `item_photo_url` | `https://...supabase.../object` |

CSV generation is **client-side** (no server round trip) → uses `Blob` + `URL.createObjectURL`.

---

## 🛡 Security & Constraints

| Aspect               | Approach                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------- |
| **Auth**             | Supabase email/password (JWT in local storage)                                           |
| **Row Access**       | Filtered by `owner_profile_id` & planned RLS policies                                    |
| **AI Privacy**       | Only summarized, truncated inventory text is sent (no raw email / personal profile data) |
| **File Upload**      | Supabase Storage – file naming uses box/item IDs + timestamp to avoid collisions         |
| **Rate Limiting**    | (Future) – Add edge function or server middleware for chat frequency                     |
| **No Hallucination** | Explicit system instructions + inventory summary emphasis                                |

---

## 🗺 Roadmap

| Status | Feature                                         |
| ------ | ----------------------------------------------- |
| ✅      | Box / item CRUD + photos                        |
| ✅      | Live search (debounced)                         |
| ✅      | Drag reorder persist                            |
| ✅      | BoxedAI context + chat                          |
| ✅      | CSV export                                      |
| 🔜     | Bulk item import (CSV → items)                  |
| 🔜     | True collaborator permissions (viewer / editor) |
| 🔜     | Activity timeline (moves, edits, deletions)     |
| 🔜     | Item “last used” smart update (auto stamp)      |
| 🔜     | Advanced filters (type, location, status)       |
| 🔜     | AI: auto-suggest packing categories             |
| 🔜     | Offline PWA caching                             |
| 🔜     | Mobile-first gesture improvements               |

---

## 🤝 Contributing

1. Fork
2. `feat/my-feature` branch
3. Add / adjust Zod schemas as needed
4. `pnpm lint && pnpm typecheck`
5. Open PR with concise description + screenshots (if UI)
6. Respond to feedback / iterate

> Bug reports / feature suggestions → open an Issue with **steps**, **expected**, **actual**.

---

## 📄 License

**MIT** – See [`LICENSE`](LICENSE).
Attribution appreciated. Do not misrepresent generated BoxedAI responses as guaranteed factual location if user inventory is incomplete.

---

## 👨🏻‍💻 Author

Built with ☕ + chaotic moving experiences by **Son Nguyen**.

* GitHub: [@hoangsonww](https://github.com/hoangsonww)
* LinkedIn: [linkedin.com/in/hoangsonw](https://www.linkedin.com/in/hoangsonw)
* Email: [hoangson091104@gmail.com](mailto:hoangson091104@gmail.com)

> \[!NOTE]
> *“Find. Pack. Ask. Relax.” – Boxed tagline*

---

**Enjoy never losing track of your stuff again.** 🧳📦🧠
PRs & feedback welcome!
