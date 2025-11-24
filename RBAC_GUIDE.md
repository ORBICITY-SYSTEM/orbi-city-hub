# ORBI City Hub - Role-Based Access Control (RBAC) Guide

## Overview

ORBI City Hub implements a 4-tier role-based access control system:

1. **Admin** - Full system access
2. **Manager** - Business operations access
3. **Staff** - Operational access
4. **Guest** - Limited read-only access

---

## Role Definitions

### 1. Administrator (admin)

**Who:** System owner, IT administrators

**Access:**
- ✅ Full access to all modules
- ✅ User management (create, edit, delete users)
- ✅ System settings and configuration
- ✅ Database backups and maintenance
- ✅ Financial data (full access)
- ✅ All reports and analytics

**Typical Users:**
- TAMAR MAKHARADZE (Owner)
- IT Administrator

---

### 2. Manager (manager)

**Who:** Business managers, department heads

**Access:**
- ✅ CEO Dashboard (view only)
- ✅ Reservations (full CRUD)
- ✅ Finance (view and create, no delete)
- ✅ Marketing (full CRUD)
- ✅ Logistics (view and edit)
- ✅ Reports & Analytics (view and export)
- ❌ User management
- ❌ System settings
- ❌ Database backups

**Typical Users:**
- General Manager
- Finance Manager
- Marketing Manager

---

### 3. Staff (staff)

**Who:** Operational staff, housekeeping, front desk

**Access:**
- ✅ Reservations (view, create, edit)
- ✅ Logistics (view, create, edit)
- ❌ CEO Dashboard
- ❌ Finance
- ❌ Marketing
- ❌ Reports
- ❌ User management

**Typical Users:**
- Front Desk Staff
- Housekeeping Staff
- Maintenance Staff

---

### 4. Guest (guest)

**Who:** External users, temporary access

**Access:**
- ✅ Limited read-only access
- ❌ Cannot create or edit anything
- ❌ Cannot access sensitive data

**Typical Users:**
- External consultants
- Auditors (temporary)
- Demo accounts

---

## Permission Matrix

| Module | Admin | Manager | Staff | Guest |
|--------|-------|---------|-------|-------|
| **CEO Dashboard** |
| View | ✅ | ✅ | ❌ | ❌ |
| Edit | ✅ | ❌ | ❌ | ❌ |
| **Reservations** |
| View | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ✅ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |
| **Finance** |
| View | ✅ | ✅ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ |
| Edit | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |
| **Marketing** |
| View | ✅ | ✅ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |
| **Logistics** |
| View | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ❌ | ❌ | ❌ |
| **Reports** |
| View | ✅ | ✅ | ❌ | ❌ |
| Export | ✅ | ✅ | ❌ | ❌ |
| **System** |
| Backups | ✅ | ❌ | ❌ | ❌ |
| Users | ✅ | ❌ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ | ❌ |

---

## User Management

### Assigning Roles

**Via Database (Admin Only):**

1. **Login to Manus Dashboard**
2. **Navigate to Database panel**
3. **Open `users` table**
4. **Find user by email**
5. **Edit `role` field:**
   - `admin` - Administrator
   - `manager` - Manager
   - `staff` - Staff
   - `guest` - Guest (default)
6. **Save changes**

**Via API (Admin Only):**

```typescript
// Update user role
await trpc.rbac.updateUserRole.mutate({
  userId: 123,
  role: "manager"
});
```

---

### Adding New Users

New users automatically get `guest` role on first login.

**To promote a user:**

1. User signs in once (creates account with `guest` role)
2. Admin updates their role in database or via API
3. User logs out and logs back in
4. New permissions take effect

---

## Implementation in Code

### Backend (tRPC Procedures)

```typescript
import { requireRole, requirePermission } from "../rbac";

// Require admin role
export const adminOnlyProcedure = protectedProcedure.use(({ ctx, next }) => {
  requireRole(ctx.user, "admin");
  return next({ ctx });
});

// Require specific permission
export const createBooking = protectedProcedure.mutation(({ ctx }) => {
  requirePermission(ctx.user, "reservations", "create");
  // ... create booking logic
});
```

### Frontend (React Components)

```typescript
import { trpc } from "@/lib/trpc";

function MyComponent() {
  // Get current user's permissions
  const { data: permissions } = trpc.rbac.getMyPermissions.useQuery();
  
  // Check if user can access module
  const canViewFinance = permissions?.accessibleModules.includes("finance");
  
  // Check specific permission
  const canCreateBooking = permissions?.modulePermissions.reservations?.includes("create");
  
  return (
    <div>
      {canViewFinance && <FinanceModule />}
      {canCreateBooking && <CreateBookingButton />}
    </div>
  );
}
```

---

## Security Best Practices

### 1. Principle of Least Privilege

- Start users with `guest` role
- Only promote when necessary
- Regularly review user roles

### 2. Separation of Duties

- Don't give everyone admin access
- Use `manager` role for business operations
- Use `staff` role for day-to-day operations

### 3. Regular Audits

**Monthly checklist:**
- [ ] Review all admin users
- [ ] Check for inactive users
- [ ] Verify role assignments
- [ ] Remove temporary access

### 4. Owner Protection

- Owner (TAMAR MAKHARADZE) is automatically assigned `admin` role
- Cannot be demoted by other admins
- Hardcoded in `server/db.ts`

---

## Common Scenarios

### Scenario 1: New Employee (Front Desk)

1. **Employee signs in** → Gets `guest` role
2. **Admin promotes to `staff`** → Can manage reservations
3. **Employee leaves** → Admin changes to `guest` or deletes

### Scenario 2: Department Manager

1. **Manager signs in** → Gets `guest` role
2. **Admin promotes to `manager`** → Can access all business modules
3. **Manager needs finance access** → Already has it!

### Scenario 3: External Consultant

1. **Consultant signs in** → Gets `guest` role
2. **Stays as `guest`** → Read-only access for audit
3. **Project ends** → Delete account

### Scenario 4: Temporary Admin Access

1. **IT contractor needs admin** → Promote to `admin`
2. **Work completed** → Demote to `guest`
3. **Contract ends** → Delete account

---

## API Reference

### Get My Permissions

```typescript
const permissions = await trpc.rbac.getMyPermissions.useQuery();

// Returns:
{
  role: "manager",
  accessibleModules: ["ceo", "reservations", "finance", "marketing", "logistics", "reports"],
  modulePermissions: {
    reservations: ["view", "create", "edit", "delete"],
    finance: ["view", "create"],
    // ...
  }
}
```

### Check Permission

```typescript
const canEdit = await trpc.rbac.checkPermission.useQuery({
  module: "finance",
  action: "edit"
});
// Returns: true or false
```

### List All Users (Admin Only)

```typescript
const users = await trpc.rbac.listUsers.useQuery();

// Returns:
[
  {
    id: 1,
    name: "TAMAR MAKHARADZE",
    email: "info@orbicitybatumi.com",
    role: "admin",
    lastSignedIn: "2025-11-24T12:00:00Z",
    createdAt: "2025-01-01T00:00:00Z"
  },
  // ...
]
```

### Update User Role (Admin Only)

```typescript
await trpc.rbac.updateUserRole.mutate({
  userId: 123,
  role: "manager"
});

// Returns:
{
  success: true,
  message: "User role updated to manager"
}
```

### Get Role Definitions

```typescript
const definitions = await trpc.rbac.getRoleDefinitions.useQuery();

// Returns:
{
  roles: [
    {
      id: "admin",
      name: "Administrator",
      description: "Full system access...",
      level: 3
    },
    // ...
  ],
  permissions: { /* full permission matrix */ }
}
```

---

## Troubleshooting

### User Can't Access Module

**Problem:** User sees "Access Denied" or module is hidden

**Solution:**
1. Check user's role in database
2. Verify role has permission for that module
3. User may need to log out and log back in

### Can't Change Own Role

**Problem:** Admin trying to change their own role

**Solution:**
- System prevents self-demotion for safety
- Ask another admin to change your role
- Or use database direct access (not recommended)

### New User Has No Access

**Problem:** New user can't see anything

**Solution:**
- New users start as `guest` (limited access)
- Admin must promote them to appropriate role
- Check permission matrix for role capabilities

---

## Future Enhancements

Planned features:

- [ ] Custom roles (beyond 4 default roles)
- [ ] Granular permissions (per-feature level)
- [ ] Time-based access (temporary permissions)
- [ ] IP-based restrictions
- [ ] Two-factor authentication (2FA)
- [ ] Audit logs (track who did what)
- [ ] Role templates (quick assign common permission sets)

---

## Support

For role assignment or permission issues:
- **Contact:** info@orbicitybatumi.com
- **Admin:** TAMAR MAKHARADZE
