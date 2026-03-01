# Account Deletion Strategy

## Overview

This application implements a **GDPR-compliant account deletion system** with two distinct options:

1. **Deactivate Account**: Soft delete with 90-day grace period (can be reactivated)
2. **Permanently Delete Account**: Immediate anonymization (irreversible)

This dual approach balances user control, privacy rights, and business requirements.

## Deletion Options

### Option 1: Deactivate Account (Soft Delete)

**When to use**: User wants to temporarily leave but might return

**What happens immediately:**

- Account marked as inactive (`active = false`)
- Deletion timestamp recorded (`deletedAt`)
- All sessions deleted (user logged out)
- **No data is anonymized** - account can be restored

**What happens after 90 days:**

- If not reactivated, account is **permanently deleted** (see Option 2)
- Cleanup script runs daily to check for expired deactivations

**How to reactivate:**

- User logs in with their original email and password within 90 days
- Account is automatically restored (`active = true`, `deletedAt = null`)
- All data (cart, favorites, orders) remains intact

**Actions:**

- User: `deactivateAccountAction()`
- Admin: `adminDeactivateUserAction(userId)`
- Reactivate: `reactivateAccountAction(email, password)`
- Admin Reactivate: `adminReactivateUserAction(userId)`

### Option 2: Permanently Delete Account (Immediate Anonymization)

**When to use**: User wants to permanently remove all personal data

**What happens immediately:**

1. **User Data Anonymization**
   - Email → `deleted_[userId]@deleted.local`
   - Name → "Deleted User"
   - Image → `null`
   - Password → `null`
   - Account marked as inactive (`active = false`)
   - Deletion timestamp recorded (`deletedAt`)

2. **Order Data Anonymization**
   - All personal data in orders is scrubbed:
     - Email → anonymized email
     - Phone → "DELETED"
     - First Name → "Deleted"
     - Last Name → "User"
     - Address → "DELETED"
     - City → "DELETED"
     - Zip Code → "00000"
     - Country → "DELETED"
   - **Order records preserved** for business/legal requirements

3. **Immediate Deletions**
   - Cart and cart items
   - Favorites
   - Sessions
   - OAuth accounts (Google, etc.)
   - Email verification tokens

**What happens after 90 days:**

- Anonymized user record is deleted (cleanup script)
- Order history remains intact

**Cannot be undone**: Once data is anonymized, it cannot be restored

**Actions:**

- User: `deleteAccountPermanently()`
- Admin: `adminDeleteUserPermanentlyAction(userId)`

## Flowchart

```
User Requests Account Deletion
         |
         v
┌────────────────────────┐
│  Choose Deletion Type  │
└────────┬───────────────┘
         |
    ┌────┴────┐
    |         |
    v         v
┌─────┐   ┌──────────┐
│Deact│   │Permanent │
│ivate│   │ Delete   │
└──┬──┘   └────┬─────┘
   |           |
   |           v
   |      ┌────────────────┐
   |      │ Anonymize Data │
   |      │ Delete Related │
   |      │     Records    │
   |      └────┬───────────┘
   |           |
   v           v
┌──────────────────────┐
│   Mark Inactive &    │
│  Set deletedAt       │
│   Sign Out User      │
└──────┬───────────────┘
       |
       v
┌──────────────────────┐
│  Within 90 Days?     │
└──────┬───────────────┘
       |
    ┌──┴──┐
    |     |
    v     v
  ┌───┐ ┌────┐
  │Yes│ │ No │
  └─┬─┘ └─┬──┘
    |     |
    v     v
 ┌────┐ ┌────────────────┐
 │Can │ │ Permanently    │
 │Reac│ │  Delete (if    │
 │tiv │ │ deactivated)   │
 │ate │ │ or Remove User │
 └────┘ │  Record (if    │
        │ anonymized)    │
        └────────────────┘
```

## Admin Capabilities

Admins can manage any user's account:

1. **Deactivate User Account**: `adminDeactivateUserAction(userId)`
   - Soft delete with 90-day grace period
   - Prevents self-deactivation

2. **Permanently Delete User Account**: `adminDeleteUserPermanentlyAction(userId)`
   - Immediate anonymization
   - Prevents self-deletion

3. **Reactivate User Account**: `adminReactivateUserAction(userId)`
   - Restore deactivated account within 90 days
   - Cannot restore permanently deleted (anonymized) accounts

**Security**: All admin actions verify admin role and prevent self-operations

## Cleanup Script

The script (`scripts/cleanup-deleted-accounts.ts`) runs daily and handles:

### Part 1: Deactivated Accounts

- Finds accounts with `active = false`, `deletedAt > 90 days ago`, email NOT starting with "deleted\_"
- **Permanently deletes** them (runs anonymization logic)
- Converts soft delete to permanent delete

### Part 2: Anonymized Accounts

- Finds accounts with `active = false`, `deletedAt > 90 days ago`, email starts with "deleted\_"
- **Removes user record** (data already anonymized)
- Orders remain in database

### Running the Script

**Manually:**

```bash
npx tsx scripts/cleanup-deleted-accounts.ts
```

**Automated (recommended):**
Set up a cron job to run daily:

```bash
0 2 * * * cd /path/to/app && npx tsx scripts/cleanup-deleted-accounts.ts
```

## Why Preserve Orders?

Orders are preserved (with anonymized data) for:

1. **Legal Compliance**: Tax and financial record-keeping requirements
2. **Business Analytics**: Sales reports, inventory tracking, revenue analysis
3. **Dispute Resolution**: Handling refunds, chargebacks, customer service issues
4. **Audit Trail**: Maintaining accurate business records

## GDPR Compliance

Both deletion options satisfy GDPR requirements:

- ✅ **Right to be Forgotten**: Personal data is anonymized or restorable by user choice
- ✅ **User Control**: Users choose between temporary and permanent deletion
- ✅ **Data Minimization**: Only userId preserved for referential integrity
- ✅ **Purpose Limitation**: Order data retained only for legitimate business purposes
- ✅ **Storage Limitation**: User records deleted after 90-day grace period

## Database Structure

### User Model

```prisma
model User {
  id         String    @id @default(cuid())
  email      String?   @unique
  name       String?
  active     Boolean   @default(true)
  deletedAt  DateTime? @map("deleted_at")
  // ... other fields
  orders     Order[]
  cart       Cart?
  favorites  Favorite[]
  sessions   Session[]
  accounts   Account[]
}
```

### Order Model

```prisma
model Order {
  id        String @id @default(cuid())
  userId    String
  email     String
  phone     String
  firstName String
  lastName  String
  address   String
  // ... other fields
  user      User   @relation(fields: [userId], references: [id])
}
```

**Note**: Order relation does NOT have `onDelete: Cascade` - orders remain when user is deleted.

## Testing

### Test Deactivation

1. Create test user, place orders
2. Deactivate account via profile settings
3. Verify:
   - User marked inactive, sessions deleted
   - User data NOT anonymized
   - Orders intact with original customer data
   - User can't log in (inactive account)
4. Log in within 90 days with original credentials
5. Verify account reactivated successfully

### Test Permanent Deletion

1. Create test user, place orders
2. Permanently delete account via profile settings
3. Verify:
   - User data anonymized immediately
   - Orders exist with anonymized customer data
   - Cart, favorites, sessions deleted
   - User can't log in (anonymized email)
   - Cannot be reactivated

### Test Admin Actions

1. Create test users
2. Admin deactivates user
3. Admin reactivates user (within 90 days)
4. Admin permanently deletes user
5. Verify all actions work and admin cannot perform on self

### Test Cleanup Script

1. Create accounts with `deletedAt` > 90 days ago
2. Run cleanup script
3. Verify deactivated accounts are permanently deleted
4. Verify anonymized accounts are removed

## Security Considerations

1. **Password Verification**: Reactivation requires valid password
2. **Grace Period**: 90-day window strictly enforced
3. **Irreversibility**: Permanent deletion cannot be undone
4. **Auth Tokens**: All sessions immediately invalidated
5. **OAuth**: Connected accounts disconnected
6. **Email Reuse**: Anonymized email format prevents conflicts
7. **Admin Protection**: Admins cannot deactivate/delete themselves

## UI Implementation

### User Profile Page

```tsx
// Two clear options with explanations
<Button onClick={deactivateAccount}>
  Deactivate Account
  <small>Can be restored within 90 days</small>
</Button>

<Button onClick={permanentlyDelete} variant="destructive">
  Permanently Delete Account
  <small>Cannot be undone</small>
</Button>
```

### Login Page

```tsx
// Check if account is deactivated
if (user && !user.active && !user.email.startsWith("deleted_")) {
  // Offer reactivation if within 90 days
  const canReactivate = /* check deletedAt */;
  if (canReactivate) {
    return <ReactivateAccountForm />;
  }
}
```

### Admin User Management

```tsx
// Per user actions
<DropdownMenu>
  <DropdownMenuItem onClick={() => deactivateUser(userId)}>
    Deactivate Account
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => permanentlyDeleteUser(userId)}>
    Permanently Delete
  </DropdownMenuItem>
  {user.deletedAt && !user.email.startsWith("deleted_") && (
    <DropdownMenuItem onClick={() => reactivateUser(userId)}>
      Reactivate Account
    </DropdownMenuItem>
  )}
</DropdownMenu>
```

## Monitoring

Key metrics to track:

- Deactivation vs permanent deletion ratio
- Reactivation rate within 90 days
- Cleanup script success/failures
- Storage impact of preserved orders

## Support

For questions about account deletion:

- Review this documentation
- Check implementations in `app/actions/account.actions.ts`
- Review cleanup script in `scripts/cleanup-deleted-accounts.ts`
