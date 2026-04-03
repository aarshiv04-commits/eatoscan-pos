# EAT'O'SCAN POS - In-App Notifications for New Tenant Registrations

## Current State
- Full SaaS POS system with Super Admin panel and tenant self-registration via `/register`.
- Backend: `registerTenant` creates tenant with `#trial` status / `#starter` plan and logs `REGISTER_TENANT` audit entry.
- Frontend: Super Admin panel has Dashboard, Clients, Audit Log, and Platform Settings pages.
- `SuperAdminLayout.tsx` shows a sidebar, top bar with principal ID, and `<Outlet />` for child pages.
- `useSuperAdminQueries.ts` fetches all tenants, stats, and audit logs via React Query.
- No in-app notification mechanism currently exists.

## Requested Changes (Diff)

### Add
- **Backend**: `getNewTenantNotifications(lastSeenTimestamp: Time): [Tenant]` — returns tenants registered after the given timestamp.
- **Backend**: `markNotificationsRead(timestamp: Time)` — stores the admin's last-read timestamp per principal, so the badge clears after viewing.
- **Frontend**: Notification bell icon in the `SuperAdminLayout` top bar with a badge showing count of unread new tenant registrations.
- **Frontend**: Dropdown panel from the bell showing a list of new tenants (business name, owner, registered time ago) with a "View All" link to the Clients page.
- **Frontend**: `useNotifications` hook that polls for new tenants since last read, manages badge count, and provides mark-as-read action.
- **Frontend**: Badge clears when user opens the notification dropdown or navigates to the Clients page.

### Modify
- `SuperAdminLayout.tsx`: Add notification bell with badge to the top bar.
- `useSuperAdminQueries.ts`: Add `useGetNewTenantNotifications` query and `useMarkNotificationsRead` mutation.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `getNewTenantNotifications` and `markNotificationsRead` to Motoko backend. Store `lastReadTimestamp` per principal in a `HashMap<Principal, Time>`.
2. Regenerate `backend.d.ts` with new method signatures.
3. Add `useNotifications` hook to `useSuperAdminQueries.ts`.
4. Update `SuperAdminLayout.tsx` top bar to show a bell icon with unread count badge.
5. Implement notification dropdown with list of new tenants (name, owner, time since registration).
6. Auto-mark as read when dropdown is opened; badge clears immediately.
7. Poll every 30 seconds via React Query refetch interval.
