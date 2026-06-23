# Frontend Payment Integration Guide

This document explains the payment integration architecture for the frontend application. It details how Subscriptions, Tipping, and Transaction Verification flows are handled across Stripe, PawaPay, and PayNow.

## Overview
The payment architecture utilizes a multi-gateway approach to support global and local users. 
1. **Stripe**: Handles global credit/debit card transactions.
2. **PawaPay**: Handles Mobile Money for supported African countries (e.g., MTN, Airtel).
3. **PayNow**: Handled specifically for users located in **Zimbabwe** (EcoCash, OneMoney, Telecash), acting as an override for PawaPay.

## Redux API Slices

The integration relies on Redux Toolkit Query (`RTK Query`) to communicate with the backend services.

### 1. `src/redux/features/subscription/subscription.api.ts`
Handles the core subscription functionality.
- **Endpoint**: `POST subscriptions/checkout/session`
- **Hook**: `useCreateCheckoutSessionMutation`
- **Updates Made**: Expanded the `TPaymentProvider` type to include `"PAYNOW"`, alongside `"STRIPE"` and `"PAWAPAY"`.

### 2. `src/redux/features/tips/tips.api.ts` [NEW]
Handles one-off tipping checkouts directly to creators.
- **Endpoints**: 
  - `POST tips/checkout/session/stripe`
  - `POST tips/checkout/session/pawapay`
  - `POST tips/checkout/session/paynow`
- **Hooks**: `useCreateStripeTipSessionMutation`, `useCreatePawaPayTipSessionMutation`, `useCreatePaynowTipSessionMutation`.

### 3. `src/redux/features/payment/payment.api.ts` [NEW]
Handles manual verification and reconciliation for fallback mechanisms in case async webhooks drop or are delayed.
- **Endpoint**: `GET transactions/verify/:providerReferenceId`
- **Hook**: `useLazyVerifyTransactionQuery`

## UI Implementation & Workflows

### A. Subscriptions Checkout (`src/components/channels/Membership.tsx`)
This component displays available subscription plans and handles the checkout provider selection.
- **Logic Added**: Dynamic country resolution using `user.country` to map to ISO3 codes.
- **Behavior**: 
  - If a user is from a `pawapayEligibleIso3` country (e.g., Kenya, Nigeria), the **PawaPay** option is shown.
  - If the user is from **Zimbabwe** (`ZWE`), PawaPay is forcefully disabled, and the **PayNow** option is displayed instead.
  - Selecting an option triggers `startCheckout(plan, provider)` and redirects the user to the respective gateway URL.

### B. Creator Tipping (`src/components/payment/TipsModal.tsx` & `src/app/(dashboard)/overview/videos/[slug]/page.tsx`)
Users can tip creators directly from the video player page.
- **Video Page (`[slug]/page.tsx`)**: A new `Tip Creator` button has been added next to the Like button in the video info bar.
- **TipsModal (`TipsModal.tsx`)**: A custom-styled modal that prompts the user for a dollar amount.
  - Similar to subscriptions, it dynamically renders the Stripe, PawaPay, or PayNow checkout buttons based on the user's geographic location.
  - Upon selecting a provider, the respective RTK Query hook is called, and the user is redirected or instructed to check their phone for USSD push notifications.

### C. Fallback Reconciliation (`src/app/(dashboard)/payment/verify/page.tsx`)
Webhooks natively handle the actual crediting of wallets in the background (`/api/v1/stripe/webhooks`, etc.). However, to ensure a seamless UX immediately after payment:
- **Flow**: Gateways redirect users back to `/payment/verify?providerReferenceId=XXX` or `?session_id=XXX`.
- **Action**: The `PaymentVerificationPage` mounts, extracts the ID, and automatically hits the `verifyTransaction` endpoint.
- **Result**: The backend reaches out to Stripe/PayNow/PawaPay, verifies the payment, manually credits the wallets if the webhook hasn't fired yet, and returns a `COMPLETED` status. The UI then shows a Success screen and provides a "Go Back" button.

## Design & Styling
All UI elements (TipsModal, Tip buttons, Membership cards) utilize utility classes keeping in line with the brand identity:
- Minimalist glassmorphism (`backdrop-blur-md`, `bg-secondary-bg/80`).
- Subtle hover effects (`hover:-translate-y-0.5`).
- Sharp primary colors (`bg-brand-primary`) without excessive shadow weights or overly rounded corners (avoiding `rounded-full` where standard `rounded-md` is the norm, except for primary floating action buttons).
