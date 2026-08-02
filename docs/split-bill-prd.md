# PRD — SplitEasy: Interactive Split Bill Web App

**Version:** 1.0
**Status:** Ready for development
**Target:** Built with Claude Code / Claude extension in VS Code

---

## 1. Overview

SplitEasy is a responsive web application for splitting bills among a group of people. Beyond the standard "assign items to people" flow found in typical split bill tools, SplitEasy adds three differentiating capabilities:

1. **Per-unit sharing** — split a single shared item by how many pieces/portions each person consumed (e.g., 8 pcs takoyaki: A ate 2, B ate 3, C ate 3).
2. **Flexible additional charges** — tax, service charge, delivery fee, and discounts can each be entered as either a **percentage** or a **fixed amount**, matching how different restaurants print their receipts.
3. **Shareable results** — the final breakdown can be **downloaded as an image** and **copied as a clickable link** that reproduces the exact result for anyone who opens it.

The app must work equally well on mobile phones, tablets (iPad), and desktop. No login or account is required. All computation happens client-side; no backend server is required for v1.

---

## 2. Goals & Non-Goals

### Goals
- Split any bill accurately, including shared items split by units consumed.
- Support mixed charge types (percent and fixed) in a single bill.
- Produce a result that is easy to share (image download + link).
- Fully responsive, touch-friendly, and fast (works offline after first load is a bonus).
- Zero friction: no sign-up, no server, opens instantly.

### Non-Goals (v1)
- No user accounts, authentication, or saved history in the cloud.
- No payment processing / money transfer integration.
- No OCR receipt scanning (candidate for v2).
- No multi-currency conversion (single currency per bill; user picks the currency symbol).
- No real-time collaboration (link sharing is read-only snapshot).

---

## 3. Target Users & Use Cases

- **Friend groups eating out** — one person pays, everyone needs to know what they owe.
- **Office lunch orders** — shared platters plus individual orders plus delivery fee.
- **Travel groups** — mixed personal and shared expenses on one receipt.

### Primary user story
> As the person who paid the bill, I want to enter what everyone ordered — including shared dishes split by pieces eaten — apply the tax and service charge exactly as printed on the receipt, and send everyone a link or image showing exactly what they owe me.

---

## 4. Core Features (Standard Split Bill)

### 4.1 People management
- Add people by name (minimum 2, soft cap 20).
- Each person gets an auto-assigned color/avatar (initials in a colored circle) used consistently across the app.
- Edit and remove people. Removing a person unassigns them from all items and prompts a confirmation if they have assignments.

### 4.2 Item entry
- Each item has: **name**, **price**, **quantity** (default 1).
- Item subtotal = price × quantity (display live).
- Items can be edited inline and deleted with an undo snackbar (5 seconds).
- Running bill subtotal always visible (sticky footer on mobile, sidebar on desktop).

### 4.3 Item assignment modes
Every item has an assignment mode selectable via a segmented control:

| Mode | Behavior |
|---|---|
| **One person** | Entire item cost goes to a single selected person. |
| **Split equally** | Cost divided equally among selected people (select 2+ via tappable chips). |
| **Split by units** | See Feature 5.1 — per-piece/portion sharing. |
| **Custom ratio** | Manually enter each person's share as amount or percentage; must total the item cost (show live validation). |

---

## 5. Additional Features (Differentiators)

### 5.1 Feature A — Split by Units (per-piece sharing)

**Problem:** A dish like takoyaki (8 pcs) is shared unevenly. Standard "split equally" is unfair when A ate 2 pcs but B ate 3.

**Spec:**
- When an item is set to **Split by units**, the user enters **total units** for the item (e.g., 8). If quantity > 1, total units = units per portion × quantity (e.g., 2 boxes × 8 pcs = 16 units; the UI should make this explicit).
- Price per unit = item total ÷ total units.
- For each participating person, the user sets **units consumed** using a stepper (− / count / +) next to the person's chip. Steppers are large enough for touch (min 44×44 px targets).
- Live counter shows `assigned units / total units` (e.g., "6 / 8 pcs assigned").
- **Validation states:**
  - `assigned < total` → warning banner: "2 pcs unassigned — assign them, or split the remainder equally?" with a one-tap **"Split remainder equally"** action among the item's participants.
  - `assigned > total` → error state, block calculation, highlight the field.
  - `assigned == total` → green check.
- Fractional units are allowed (e.g., 0.5 pcs) via direct input, but steppers increment by 1.
- Person's cost for the item = units consumed × price per unit.

**Example (acceptance test):**
Takoyaki, price 40,000, 8 pcs. A = 2, B = 3, C = 3.
Per-unit = 5,000. → A owes 10,000; B owes 15,000; C owes 15,000. ✅

### 5.2 Feature B — Additional Charges: Percent OR Fixed Amount

**Problem:** Some receipts show "Tax 11%", others show "Tax: Rp 13,750" as a pre-computed number. Users must be able to enter it exactly as printed.

**Spec:**
- A dedicated **Charges** section below the items list. User can add multiple charges. Each charge has:
  - **Label** (free text, with quick presets: Tax, Service Charge, Delivery Fee, Packaging, Tip, Discount).
  - **Type toggle:** `%` or fixed amount (a two-state pill toggle, defaulting to `%` for Tax/Service and fixed for Delivery).
  - **Value** (numeric input; for % allow decimals like 11.5).
  - **Kind:** charge (adds) or discount (subtracts). Discount uses the same %/fixed toggle.
- **Order of application:** percent charges are computed on the **items subtotal** (not compounded on other charges) by default. Provide an advanced toggle per percent charge: "apply after previous charges" for restaurants that compute service charge first, then tax on (subtotal + service). Default OFF to keep it simple.
- **Distribution rule:** every charge/discount is distributed to each person **proportionally to their pre-charge share of the subtotal**.
  - `personCharge = charge × (personSubtotal / billSubtotal)`
  - This applies to both percent and fixed charges. (Rationale: a fixed delivery fee split proportionally is the most common convention; see open question §12 for an "split fees equally" option.)
- **Rounding:** round each person's final total to the smallest currency unit (configurable: 1, 100, or 500 — useful for IDR cash rounding, default 1). Any rounding leftover (±) is assigned to the bill payer and displayed transparently as a "rounding adjustment" line so totals always reconcile with the receipt.

**Example (acceptance test):**
Subtotal 100,000 (A's items = 40,000, B's = 60,000). Tax 11% (=11,000), Delivery fixed 10,000.
- A: 40,000 + 11,000×0.4 + 10,000×0.4 = 40,000 + 4,400 + 4,000 = **48,400**
- B: 60,000 + 6,600 + 6,000 = **72,600**
- Total = 121,000 = 100,000 + 11,000 + 10,000 ✅

### 5.3 Feature C — Shareable Results (Image + Link)

**C1. Download as image**
- On the Results screen, a **"Download image"** button renders the summary card to a PNG (2× pixel density for sharpness) and triggers download (`split-bill-YYYYMMDD.png`). On mobile browsers that support the Web Share API with files, offer **"Share image"** which opens the native share sheet (WhatsApp, etc.).
- The image is a purpose-designed summary card (not a raw screenshot): app name/logo, bill title & date, per-person totals with their item breakdown, charges section, grand total, and a footer with the share link's short note. Must remain legible at WhatsApp preview sizes.
- Implementation: render a dedicated hidden "receipt card" DOM node and rasterize with `html-to-image` (or `html2canvas`). The card uses a fixed width (~480 px logical) so output is identical across devices.

**C2. Copy as link**
- **"Copy link"** button produces a URL that fully reproduces the result for anyone who opens it — with **no backend**.
- Mechanism: serialize the entire bill state (people, items, assignments, charges, settings) to JSON → compress (`lz-string` `compressToEncodedURIComponent`) → place in the URL **hash fragment**: `https://app.example.com/#b=N4IgzgpgTg...`
  - Hash (not query string) keeps the payload out of server logs and avoids length issues with static hosting.
  - On load, if `#b=` is present, decompress and hydrate directly into the **read-only Results view**, with an "Edit a copy" button that clones the state into the editor.
  - Show a warning if decoding fails ("This link is invalid or from a newer version") — never crash.
  - Include a schema `version` field in the payload for forward compatibility.
- Copy action uses the Clipboard API with a "Link copied ✓" toast; fall back to a select-all text field on older browsers.
- Practical limit: warn the user if the encoded URL exceeds ~8,000 characters (extremely large bills) and suggest the image option instead.

---

## 6. Screens & User Flow

A single-page app with a 4-step flow. On desktop/iPad, steps 1–3 can be shown as a two-column layout (editor left, live summary right). On mobile, it's a linear stepper with a sticky bottom bar (subtotal + Next button).

1. **People** — add participants.
2. **Items** — add items, choose assignment mode per item, assign.
3. **Charges** — add tax/service/fees/discounts (%/fixed).
4. **Results** — per-person cards (tap to expand full breakdown: each item line with their share, each charge share, rounding), grand total reconciliation vs. receipt, and the share actions (Download image / Share image / Copy link).

Global elements: bill title + date (editable, defaults to "Split Bill — {today}"), currency selector (symbol + rounding unit; default from browser locale, e.g., Rp for id-ID), dark/light mode following system preference, "Reset bill" with confirmation.

**Persistence:** auto-save working state to `localStorage` on every change; restore on revisit with a "Resume previous bill?" prompt.

---

## 7. Design & Responsiveness Requirements

- **Breakpoints:** mobile < 640 px (single column, stepper), tablet 640–1024 px (wider cards, two columns where useful), desktop > 1024 px (two-pane editor + live summary).
- **Touch-first:** all interactive targets ≥ 44×44 px; steppers and chips optimized for thumbs; numeric inputs use `inputmode="decimal"` to trigger the numeric keyboard.
- **Interactive feel:** subtle transitions on assignment (chip fills with person's color), live-updating totals everywhere, undo for destructive actions, empty states with helpful hints.
- **Accessibility:** WCAG AA contrast, full keyboard operability on desktop, ARIA labels on steppers and toggles, person colors always paired with names/initials (never color alone).
- **Performance:** first load < 200 KB JS gzipped target; all calculation synchronous and instant.

---

## 8. Recommended Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **React 18 + Vite + TypeScript** | Fast dev loop, strong typing for money math, Claude Code works very well with it |
| Styling | **Tailwind CSS** | Rapid responsive design |
| State | **Zustand** (or React context + useReducer) | Simple global bill state, easy localStorage persistence middleware |
| Image export | **html-to-image** | Lightweight DOM→PNG |
| Link encoding | **lz-string** | Tiny, battle-tested URL-safe compression |
| Money math | Integers in **smallest currency unit** (e.g., store 40000 as 40000, and cents-based currencies ×100) | Avoid floating point errors entirely |
| Testing | **Vitest** for the calculation engine | The math must be provably correct |
| Hosting | Vercel / Netlify / GitHub Pages | Static, free, HTTPS |

> **Important:** keep the entire calculation engine as a pure, framework-free TypeScript module (`src/lib/calc.ts`) with unit tests. UI only renders its output.

---

## 9. Data Model (TypeScript)

```ts
type Currency = { symbol: string; roundingUnit: 1 | 100 | 500 };

type Person = { id: string; name: string; color: string };

type AssignmentMode = "single" | "equal" | "units" | "custom";

type Item = {
  id: string;
  name: string;
  price: number;        // integer, smallest currency unit, per single quantity
  quantity: number;     // >= 1
  mode: AssignmentMode;
  // mode-specific:
  singlePersonId?: string;                     // mode = single
  equalPersonIds?: string[];                   // mode = equal
  totalUnits?: number;                          // mode = units (per full item incl. quantity)
  unitAssignments?: { personId: string; units: number }[]; // mode = units
  customShares?: { personId: string; amount: number }[];   // mode = custom
};

type Charge = {
  id: string;
  label: string;
  kind: "charge" | "discount";
  valueType: "percent" | "fixed";
  value: number;            // percent as e.g. 11.5, fixed as integer amount
  applyAfterPrevious: boolean; // default false: percent applies to items subtotal
};

type Bill = {
  version: 1;
  title: string;
  dateISO: string;
  currency: Currency;
  payerId?: string;         // who paid; receives rounding adjustment
  people: Person[];
  items: Item[];
  charges: Charge[];
};

type PersonResult = {
  personId: string;
  itemLines: { itemId: string; label: string; share: number }[];
  chargeLines: { chargeId: string; label: string; share: number }[];
  subtotal: number;
  total: number;            // rounded
};

type BillResult = {
  perPerson: PersonResult[];
  billSubtotal: number;
  chargesTotal: number;
  grandTotal: number;
  roundingAdjustment: number; // signed, assigned to payer
};
```

---

## 10. Calculation Engine Rules (authoritative)

1. Compute each person's **item subtotal** by summing their share of every item according to its mode.
2. `billSubtotal = Σ personSubtotal` (must equal Σ item totals; assert in tests).
3. For each charge in order:
   - base = `billSubtotal` if `applyAfterPrevious` is false, else running total so far.
   - chargeAmount = percent ? `base × value/100` : `value`. Discounts are negative.
   - Distribute to each person: `personShare = chargeAmount × personSubtotal / billSubtotal`.
   - Edge case: if `billSubtotal == 0`, distribute equally among all people.
4. `personRawTotal = personSubtotal + Σ personChargeShares`.
5. Round each personRawTotal to `roundingUnit` (round half up). `roundingAdjustment = grandTotalExact − Σ roundedTotals`, applied to the payer's line (or first person if no payer set) and displayed.
6. Invariant (unit test): Σ displayed person totals + roundingAdjustment line == exact receipt grand total.

---

## 11. Acceptance Criteria Checklist

- [ ] Takoyaki test (§5.1 example) produces exactly 10,000 / 15,000 / 15,000.
- [ ] Mixed charges test (§5.2 example) produces exactly 48,400 / 72,600.
- [ ] A bill with % tax + fixed delivery + % discount reconciles to the receipt total.
- [ ] Units mode blocks over-assignment and offers "split remainder equally" on under-assignment.
- [ ] Downloaded PNG is legible and identical across devices.
- [ ] Opening a copied link on another device shows the identical result read-only; "Edit a copy" works.
- [ ] Corrupted/foreign link shows a friendly error, never a blank crash.
- [ ] Fully usable at 360 px wide (small Android), on iPad portrait/landscape, and at 1440 px desktop.
- [ ] Refresh mid-editing restores the bill from localStorage.
- [ ] No floating point artifacts anywhere (e.g., no 4,399.999999).

---

## 12. Open Questions / v2 Ideas

- Option to split **fixed** fees (delivery) **equally** instead of proportionally — likely a per-charge toggle in v1.1.
- Receipt OCR (photo → items) — v2.
- "Who pays whom" settlement optimization when multiple people paid — v2.
- Saved friends list and bill history — v2.
- PWA install + offline support — v1.1 (cheap win with Vite PWA plugin).

---

## 13. Suggested Build Milestones (feed to Claude Code one at a time)

1. **M1 — Engine:** implement `src/lib/calc.ts` + Vitest tests covering §10 and §11 math cases. No UI.
2. **M2 — Core UI:** people + items + single/equal modes, responsive shell, localStorage.
3. **M3 — Units & custom modes:** steppers, validation states, remainder action.
4. **M4 — Charges:** %/fixed toggle, discounts, apply-after-previous, rounding + payer adjustment.
5. **M5 — Results & sharing:** results cards, PNG export, Web Share API, lz-string link encode/decode, read-only view.
6. **M6 — Polish:** dark mode, animations, accessibility pass, error states, empty states.
