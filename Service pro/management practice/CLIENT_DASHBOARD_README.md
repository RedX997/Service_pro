# Client Dashboard Module - Implementation Guide

## 1. Project Overview & Integration
The Client Dashboard as part of **Service Pro** is designed to provide a premium, transparent experience for clients. It leverages the existing tech stack to bridge the gap between back-office operations and client visibility.

### Current Tech Stack Alignment:
*   **Frontend:** React 18+ (Vite), Tailwind CSS, Lucide Icons.
*   **State Management:** TanStack Query (React Query) for data fetching.
*   **Backend:** Node.js with Express and Prisma ORM.
*   **Database:** PostgreSQL (via Prisma).
*   **Security:** Role-Based Access Control (RBAC) via `StrictProtectedRoute` and `rbac.ts` utilities.
*   **Notifications:** Integrated with the existing `notify.js` helper system.

---

## 2. Core Modules (Project Specific)

### A. First-Time Onboarding & Compliance
*   **Flow:** Once a visitor is converted to a client (via `/api/visitors/:id/convert`), they are added to the `clients` table and assigned a `user` record with the `CLIENT` role.
*   **Activation:** The initial login triggers a `StrictProtectedRoute` check for the `termsAccepted` flag.
*   **OTP Validation:** Integration with the notification system to send verification codes upon T&C acceptance.

### B. Service Progress Tracker
*   **Data Source:** Fetches from the `services` and `tasks` associated with the logged-in client's ID.
*   **Visual Workflow:** Instead of a simple list, services will show a progress bar (e.g., *Application -> Document Verification -> Processing -> Completed*).
*   **Assigned Staff:** Displays the name and contact of the employee linked via `assignedEmployee` in the client record.

### C. The "Vault" (Document Management)
*   **Sync Logic:** Reflects documents recorded by the receptionist or employee.
*   **Status Indicators:**
    *   `Checked`: Document verified and in-hand.
    *   `Pending`: Action required by client.
    *   `Uploaded`: (Recommended) Allow clients to upload missing documents directly to reduce office visits.
*   **Audit Trail:** Every document update is logged via `logClientActivity` and visible to the client in their "Activity History".

### D. Real-Time Communication Hub
*   **Contextual Chat:** Messaging threads unique to each service (GST vs. Income Tax).
*   **Status Monitoring:** Clients see if an employee has read their message. Employees see "Red Zone" alerts in their staff dashboard for unanswered client queries.
*   **WebSocket Integration:** (Recommended) Use the existing notification infrastructure to power real-time message bubbles.

---

## 3. Recommended Additions (Beyond Storyline)

### I. Security & Data Privacy
*   **Two-Factor Authentication (2FA):** Optional SMS/Email 2FA for sensitive document access.
*   **Session Management:** Auto-logout after inactivity to protect client data on shared devices.
*   **Audit Visibility:** Allow clients to see a log of "Who accessed my documents and when" to build deep trust.

### II. Financial Summary (If Applicable)
*   **Invoicing:** View pending and paid invoices for services rendered.
*   **Payment Integration:** Direct link to payment gateways (Razorpay/Stripe) for service fees.

### III. Client Self-Service Profile
*   **KYC Update:** Allow clients to update their own address, contact details, or upload multiple Director profiles for company services.
*   **Notification Preferences:** Toggle between Email, SMS, or App Push notifications.

### IV. "Know Your Service" (KYS) Helpdesk
*   **Knowledge Base:** Short FAQ/Videos explaining what documents are needed for GST or Income Tax to reduce common queries.
*   **Support Tickets:** Raise formal tickets for technical app issues.

---

## 4. Technical Roadmap (Updated)

1.  **Phase 1 (Identity):** 
    *   Update `prisma.schema` to include `termsAccepted` or `onboardingStatus` on the User model.
    *   Create `ClientDashboard.tsx` and register in `App.tsx` routes.
2.  **Phase 2 (Services):** 
    *   Backend route for `GET /api/client/services` (scoped to currently logged-in user).
    *   Frontend Service List with progress indicators.
3.  **Phase 3 (Vault & History):** 
    *   Display Document Checklist from the database.
    *   Read-only view of `client_activity_logs` filtered for the client.
4.  **Phase 4 (Messaging):** 
    *   Implementation of the Chat UI.
    *   Backend message storage and "Red Zone" status logic.
5.  **Phase 5 (App Sync):** 
    *   Finalize API endpoints for the Hybrid mobile application.
