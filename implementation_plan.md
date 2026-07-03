# Payout and Withdrawal Workflow Update Plan

Review of the frontend payout configuration, onboarding, and withdrawal pipeline based on the provided guides:
- [PAYOUT_SETTINGS_FRONTEND_API_GUIDE (2).md](file:///c:/Users/naim0018/Downloads/Telegram%20Desktop/PAYOUT_SETTINGS_FRONTEND_API_GUIDE%20(2).md)
- [WITHDRAWALS_AND_STRIPE_CONNECT_GUIDE (3).md](file:///c:/Users/naim0018/Downloads/Telegram%20Desktop/WITHDRAWALS_AND_STRIPE_CONNECT_GUIDE%20(3).md)
- [PAYOUTS_SCHEDULES_WITHDRAWALS_WORKFLOW_GUIDE (2).md](file:///c:/Users/naim0018/Downloads/Telegram%20Desktop/PAYOUTS_SCHEDULES_WITHDRAWALS_WORKFLOW_GUIDE%20(2).md)

---

## User Review Required

> [!IMPORTANT]
> - **Unified Withdrawal Endpoint**: Both Stripe Connect and Mobile Money payouts now route through `POST /api/v1/withdrawal-requests` instead of a separate Stripe endpoint.
> - **Stripe Connect Onboarding**: We are removing the manual input of Stripe Connected Account ID in the frontend. Creators will instead trigger the hosted Stripe Connect Onboarding redirect flow.
> - **Mobile Money Providers**: Mobile money settings will collect actual provider names (e.g., MTN, Airtel, EcoCash) instead of processor/gateway names (PawaPay/PayNow).
> - **Zimbabwe Support**: Zimbabwe mobile money settings can be saved but return `status: "UNSUPPORTED"` with a reason. Withdrawals are blocked for these configurations.

---

## Proposed Changes

### Redux API Feature: Wallet API
#### [MODIFY] [wallet.api.ts](file:///c:/Users/naim0018/Desktop/Projects/jiji-fans-frontend/src/redux/features/wallet/wallet.api.ts)
- Add `createStripeOnboardingLink` mutation mapping to `POST /api/v1/payout-settings/stripe/onboarding`.
- Ensure type definitions accommodate new fields: `type`, `providerName`, `country`, `phoneNumber`, `accountHolderName`, `status`, `unsupportedReason`, and `requirementsDue`.

### Wallet Page View
#### [MODIFY] [page.tsx](file:///c:/Users/naim0018/Desktop/Projects/jiji-fans-frontend/src/app/(dashboard)/wallet/page.tsx)
- **Stripe Onboarding Logic**:
  - Remove manual input field for `stripeConnectedAccountId`.
  - When "Stripe Connect" is selected and saved/edited, call the API to create the settings, retrieve the onboarding link, and redirect the user.
  - Show a banner with a resume/complete button if `status` is `ACTION_REQUIRED`.
- **Mobile Money Provider List**:
  - Update mobile money provider dropdown to list actual providers (e.g., MTN, Airtel, EcoCash, etc.) depending on the user's country context.
  - Automatically resolve and submit `country` field from profile data.
  - Submit unified settings payload with compatibility parameters (both legacy and new fields) to ensure full backend support.
- **Withdrawal Validation**:
  - Use unified `submitRequest` endpoint (`POST /withdrawal-requests`) for all withdrawals (Stripe Connect and Mobile Money).
  - Disable "Withdraw Funds" button and display helper text if payout settings are not configured, or have a status of `ACTION_REQUIRED` or `UNSUPPORTED`.

---

## Verification Plan

### Automated Tests
- Run Next.js build validation: `npm run build` or inspect Next.js development server console for any compilation and TypeScript errors.

### Manual Verification
1. Navigate to Creator Wallet page `/wallet`.
2. Open Payout Settings tab:
   - Select Stripe Connect: Verify it triggers settings setup and redirects to Stripe onboarding (or shows loading, then error if backend is offline).
   - Select Mobile Money: Verify dropdown lists correct local carrier providers, and country matches profile context.
3. Verify withdrawal button shows correct alerts when KYC is pending, minimum threshold is unmet, or payout settings are incomplete.
