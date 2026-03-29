Here's a comprehensive breakdown of everything the frontend needs — organized by role, screen, and interaction flow.

---

## System overview

The frontend has three distinct role-based experiences (Employee, Manager, Admin), a shared authentication layer, and a company onboarding flow. Every role sees the same shell (sidebar nav, header, notifications) but with completely different content areas.

---

## 1. Authentication & onboarding

**Sign up screen** — email, password, name, country selector (fetched from `restcountries.com` API). On first signup, the system detects no existing company and triggers the company creation flow.

**Company creation flow** (auto-triggered for first user):
- Country selection auto-fills the default currency
- User is assigned Admin role automatically
- Redirect to Admin dashboard after setup

**Login screen** — standard email/password with role-based redirect after auth (Admins → Admin dashboard, Managers → Approval queue, Employees → Expense submission).

---

## 2. Admin screens

**Dashboard** — stats cards: total employees, pending approvals, total expenses this month (in company currency), approval rule count. Quick action buttons: Add User, Configure Rules.

**User management** — a table of all users with columns: Name, Email, Role, Manager (if employee), Status. Actions: Edit role, Assign manager, Deactivate. "Add User" opens a modal with fields: name, email, role selector, and (if Employee) a manager assignment dropdown.

**Manager-employee mapping** — a visual org chart or table showing who reports to whom. Admin can drag-reassign or use dropdowns.

**Approval workflow builder** — this is the most complex admin screen. It has two sections:

*Sequential chain builder*: a drag-and-drop step list where each step is a user (or group). A toggle per step: "IS_MANAGER_APPROVER" — if checked, the employee's direct manager is inserted before this chain. Steps can be added, removed, reordered.

*Conditional rule configurator*: a form to define rules on top of the chain. Rule type selector: Percentage / Specific Approver / Hybrid. For percentage: a number input (e.g. 60%). For specific approver: a user picker. For hybrid: both fields with an "OR" label between them. A preview section shows a plain-English summary: "Expense is approved when 60% of approvers act, OR the CFO approves."

**Company settings** — company name, default currency (read-only after setup), country.

---

## 3. Employee screens

**Expense submission form** — the primary screen. Fields:
- Amount (numeric) + currency selector (all world currencies, defaults to company currency but can be changed)
- Category dropdown (Travel, Food, Supplies, Entertainment, Other)
- Description text area
- Date picker
- Receipt upload (image/PDF)

**OCR processing** — after upload, a loading state shows "Reading receipt…" then auto-fills Amount, Date, Description, Category with extracted values. Each auto-filled field gets a small "auto-filled" badge. User can override any field.

**Currency conversion preview** — below the amount field, once a non-company currency is selected, a live preview shows: "₹4,218 (converted from $50.00 at 1 USD = ₹84.36)". This calls the exchange rate API.

**Expense history table** — columns: Date, Description, Category, Amount (original), Amount (company currency), Status badge (Pending / Approved / Rejected), Actions (View detail).

**Expense detail modal/page** — shows all submitted fields, the receipt image, conversion info, and a timeline of approval events: each approver who acted, their decision, timestamp, and comment. If rejected, the rejection reason is highlighted prominently.

**Status filter tabs** — All / Pending / Approved / Rejected above the table.

---

## 4. Manager screens

**Approval queue** — a list/table of expenses awaiting this manager's action. Each row: Employee name, Expense description, Amount in company currency (with original currency in small text), Category, Submitted date, "Review" button.

**Expense review modal** — opens when clicking Review. Shows:
- Employee details (name, department)
- Expense details (all fields)
- Receipt image (zoomable)
- Currency conversion details
- Comments from previous approvers (if any)
- Approve / Reject buttons
- Comment input (required on Reject, optional on Approve)

**Team expenses view** — a read-only table of all expenses from the manager's direct reports. Filterable by status, date range, category.

---

## 5. Shared components

**Notification bell** — shows count of pending actions. Clicking opens a dropdown list of notifications (e.g. "Your expense #42 was approved", "New expense from John needs review").

**Sidebar navigation** — role-adaptive: Employees see Submit Expense + My Expenses. Managers see Approval Queue + Team Expenses. Admins see Dashboard + Users + Approval Rules + Settings.

**Currency display** — wherever money is shown to managers/approvers, it always renders in company currency with a tooltip or sub-label showing original currency + exchange rate.

---

## Page/route map---

## 6. Key UI states to handle

**Loading states** — OCR processing, currency conversion fetch, approval submission all need skeleton loaders or spinners with descriptive text, not just a spinner.

**Empty states** — "No expenses yet" for new employees, "No pending approvals" for managers with a clear queue. Both need a CTA (Submit your first expense / You're all caught up).

**Error states** — OCR failure (show manual entry prompt), API exchange rate failure (show "conversion unavailable, enter amount manually"), form validation (inline field errors).

**Optimistic updates** — when an employee submits an expense, it should appear in their history immediately as "Pending" without waiting for a full refetch.

**Real-time status** — the approval timeline on the expense detail page is the key transparency feature. It should show each step clearly: who acted, when, what decision, and their comment.

---

## 7. Critical UX rules

- **Currency context everywhere**: any money figure shown to a manager or approver must be in company currency. The original amount in the employee's submitted currency appears as a secondary label.
- **Comment required on rejection**: the Reject button should be disabled until the comment textarea has content.
- **OCR is assistive, not authoritative**: auto-filled fields must be visually distinguished and editable. Never silently submit OCR data.
- **Approval chain progress**: on the expense detail view, show the full chain as a vertical stepper — completed steps in solid color, current step highlighted, future steps grayed out.
- **Role guards**: employees must not be able to access the approval queue URL even directly. All protected routes need role checks with redirect to their own dashboard.

The most technically involved screens are the **approval workflow builder** (Admin) and the **expense submission form** (Employee with OCR + live FX conversion). These should be built and tested first as they carry the most business logic.