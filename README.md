# TrustLoad

Transparent group money for pooled cross-border buying trips. Group buyers fund a shared PayPal pot, a designated traveler purchases goods abroad, multimodal AI verifies supplier invoices against the group's order manifest before consensus payouts, and leftover funds are automatically reconciled and refunded per member.

Built for the **PayPal AI Hackathon 2026**.

---

## How PayPal Is Used

TrustLoad integrates the **PayPal REST API (Sandbox)** (`https://api-m.sandbox.paypal.com`) end-to-end across contributions, staged payouts, webhooks, and final refunds (`backend/src/contributions/paypal.service.ts`):

1. **Member Pool Contributions (`Orders v2`):**
   - `POST /groups/:groupId/members/:memberId/contributions/orders` creates a PayPal `CAPTURE` order (`POST /v2/checkout/orders`) and returns an `approvalUrl`.
   - The frontend redirects the member to PayPal Checkout and handles the return/cancel callbacks at `/paypal/return` and `/paypal/cancel`.
   - On return, `POST /contributions/orders/:paypalOrderId/capture` captures the funds (`POST /v2/checkout/orders/:orderId/capture`) and records a `CONTRIBUTION` entry in the group ledger.
2. **Staged Traveler Payouts (`Payouts v1`):**
   - When a release request reaches the group's approval quorum (`approvalThreshold`), `POST /release-requests/:id/payout` dispatches a payout (`POST /v1/payments/payouts`) to the designated traveler and logs a `STAGED_RELEASE` entry.
3. **Final Settlement Refunds (`Captures Refund v2` & `Payouts v1`):**
   - On trip closeout (`POST /groups/:groupId/settlement`), unspent surplus owed back to each member is refunded via `POST /v2/payments/captures/:captureId/refund` (with PayPal Payouts fallback if needed) and recorded as `REFUND` entries.
4. **Webhook Verification (`Notifications v1`):**
   - `POST /webhooks/paypal` verifies PayPal webhook signatures (`POST /v1/notifications/verify-webhook-signature`) and processes `PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.COMPLETED`, and `CHECKOUT.ORDER.APPROVED` events.

---

## How AI Is Used

TrustLoad uses **Google Gemini Multimodal AI** (`gemini-3.1-flash-lite` via `backend/src/ai/`) to automate receipt auditing and cost splitting across languages and currencies:

1. **Multilingual Invoice OCR & Translation (`AiExtractionService`):**
   - Reads uploaded supplier invoice images and PDFs (`POST /ai/invoices/extract`, `POST /release-requests/:id/extract`), extracting supplier name, invoice date, source language (e.g., Arabic `ar-AE`, Chinese `zh-CN`), currency, line items, and grand total with per-field confidence scores.
2. **Manifest & Arithmetic Verification (`AiVerificationService`):**
   - Audits extracted invoice line items against the group's combined order manifest (`POST /release-requests/:id/verify`, `POST /groups/:groupId/invoices/verify`).
   - Flags discrepancies before members vote—such as quantity overages (`QUANTITY_EXCEEDS_ORDER`), arithmetic mismatches between line items and grand total, or unlisted items.
3. **Receipt Extraction & Fair Cost Allocation (`AiAllocationService`):**
   - Extracts final trip receipts (`POST /groups/:groupId/receipts`), separates direct goods from shared logistics/shipping/customs costs, converts foreign currencies to the group's base currency, and calculates each member's net owed or refund balance (`POST /groups/:groupId/receipts/allocate`).

---

## Tools & Technologies Used

### Frontend (`frontend/`)
- **Next.js `16.4.5`** (App Router + Turbopack)
- **React `19.3.0`** & **TypeScript `^5`**
- **Tailwind CSS `^4`** (`@tailwindcss/turbopack`)
- **Google Fonts** (`Bricolage Grotesque`, `Public Sans`) & **Material Symbols Outlined**
- **ESLint `^9`** (`eslint-config-next`)

### Backend (`backend/`)
- **NestJS `^12.0.1`** (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/cli`)
- **Swagger / OpenAPI** (`@nestjs/swagger` `^12.1.1`) — interactive API docs at `/docs`
- **Prisma `^7.10.1`** (`prisma`, `@prisma/client`, `@prisma/adapter-pg`)
- **PostgreSQL on Neon** (`pg` `^8.23.1`)
- **TypeScript `^6.0.2`**, **Jest `^30.0.0`**, **Supertest `^7.0.0`**, **oxlint `^1.58.0`**, **Prettier `^3.4.2`**

### External Services
- **PayPal Developer Sandbox API** (Orders v2, Payouts v1, Captures Refund v2, Webhooks v1)
- **Google Gemini API** (`gemini-3.1-flash-lite`)

---

## Setup Instructions

### Prerequisites
- **Node.js** `>= 20` and **npm**
- A **PostgreSQL** database (e.g., [Neon](https://neon.tech))
- **PayPal Sandbox** credentials (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`) from the [PayPal Developer Dashboard](https://developer.paypal.com)
- A **Google Gemini API key** (`GEMINI_API_KEY`) from [Google AI Studio](https://aistudio.google.com)

### 1. Clone & Install Dependencies

```bash
git clone <your-public-repo-url>
cd trustload

npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure Environment Variables

Copy the example environment files and fill in your credentials (never commit `.env` files):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

**`backend/.env`:**
- `PORT=3001`
- `CORS_ORIGIN=http://localhost:3000`
- `DATABASE_URL="postgresql://..."`
- `PAYPAL_MODE="sandbox"`
- `PAYPAL_API_BASE_URL="https://api-m.sandbox.paypal.com"`
- `PAYPAL_CLIENT_ID="..."`
- `PAYPAL_CLIENT_SECRET="..."`
- `GEMINI_API_KEY="..."`
- `AI_MODEL="gemini-3.1-flash-lite"`

**`frontend/.env.local`:**
- `NEXT_PUBLIC_API_URL="http://localhost:3001"`

### 3. Set Up the Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Run the Application

Start the backend API (`http://localhost:3001`) and frontend (`http://localhost:3000`) in separate terminals:

```bash
# Terminal 1: NestJS API
npm run dev:backend

# Terminal 2: Next.js Frontend
npm run dev:frontend
```

- **Frontend App:** `http://localhost:3000`
- **Swagger / OpenAPI Docs:** `http://localhost:3001/docs`

### 5. Build & Tests

```bash
npm run build
npm run test:backend
```

---

## License

This project is licensed under the **MIT License** — see the [`LICENSE`](LICENSE) file for details.
