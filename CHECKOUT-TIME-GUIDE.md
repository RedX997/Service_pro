# Checkout Time - Complete Guide

## How Checkout Time Works

The `checkOutTime` field is automatically recorded when a visitor completes their visit or is converted to a client.

---

## Where Checkout Time is Stored

### Database Schema
```prisma
model Visitor {
  id           String    @id @default(uuid())
  name         String
  phone        String?
  purpose      String
  hostId       String?
  checkInTime  DateTime  @default(now())    ← Check-in time (automatic)
  checkOutTime DateTime?                     ← Check-out time (manual)
  status       String    @default("active")
  notes        String?
  createdAt    DateTime  @default(now())
}
```

**Key Points**:
- `checkInTime`: Set automatically when visitor is registered
- `checkOutTime`: Set when visitor checks out or is converted
- `checkOutTime` is **nullable** (can be null if visitor hasn't checked out yet)

---

## How Checkout Time is Set

### Method 1: Complete Button (Normal Checkout)

**When**: Receptionist clicks "Complete" button on a visitor

**Backend API**: `POST /api/visitors/:id/checkout`

```typescript
router.post('/:id/checkout', async (req, res) => {
  const visitor = await prisma.visitor.update({
    where: { id: req.params.id },
    data: {
      checkOutTime: new Date(),  ← SETS CURRENT TIME
      status: 'completed',
    },
  });
  res.json(visitor);
});
```

**Frontend**: `src/pages/Visitors.tsx`
```typescript
const handleCheckOut = async (visitor: Visitor) => {
  await checkOutVisitorMutation.mutateAsync(visitor.id);
  // This calls the /checkout endpoint
};
```

### Method 2: Convert to Client (Conversion Checkout)

**When**: Receptionist converts visitor to client

**Backend API**: `POST /api/visitors/:id/convert`

```typescript
router.post('/:id/convert', async (req, res) => {
  const visitor = await tx.visitor.update({
    where: { id: visitorId },
    data: {
      status: 'converted',
      checkOutTime: new Date(),  ← ALSO SETS CHECKOUT TIME
    },
  });
  // Also creates client record
});
```

---

## How to Access Checkout Time

### 1. In Visitors Page (Already Implemented)

**Display Logic**:
```typescript
// Show checkout time if it exists
{visitor.checkOutTime && (
  <div className="text-xs text-muted-foreground">
    Checked out: {new Date(visitor.checkOutTime).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}
  </div>
)}
```

**What You'll See**:
- Before checkout: Shows "Wait: 15m" (time since check-in)
- After checkout: Shows "Duration: 45m" + "Checked out: 3:30 PM"

### 2. In Database Query

**Using Prisma**:
```typescript
// Get all visitors with checkout time
const visitors = await prisma.visitor.findMany({
  where: {
    checkOutTime: { not: null }  // Only checked-out visitors
  }
});

// Get visitors still in building (not checked out)
const activeVisitors = await prisma.visitor.findMany({
  where: {
    checkOutTime: null  // No checkout time yet
  }
});
```

### 3. Calculate Visit Duration

```typescript
const calculateDuration = (checkInTime: Date, checkOutTime: Date) => {
  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// Usage
if (visitor.checkOutTime) {
  const duration = calculateDuration(
    new Date(visitor.checkInTime),
    new Date(visitor.checkOutTime)
  );
  console.log(`Visit duration: ${duration}`);
}
```

---

## Visual Display Examples

### Before Checkout (checkOutTime = null)
```
┌─────────────────────────────────────┐
│ 👤 Test A                           │
│ 📱 1234567890                       │
│ Purpose: Consultation               │
│                                     │
│ Status: [Waiting] 🟡               │
│ ⏱️ Wait: 15m                        │
│ Assigned: Ankit Sharma              │
│                                     │
│ [Start Meeting] [Convert to Client] │
└─────────────────────────────────────┘
```

### After Checkout (checkOutTime = "2026-03-06T15:30:00")
```
┌─────────────────────────────────────┐
│ 👤 Test A                           │
│ 📱 1234567890                       │
│ Purpose: Consultation               │
│                                     │
│ Status: [Completed] ✅              │
│ ⏱️ Duration: 45m                    │
│ 🕐 Checked out: 3:30 PM             │
│ Assigned: Ankit Sharma              │
└─────────────────────────────────────┘
```

---

## Testing Checkout Time

### Step 1: Add a Visitor
1. Go to Visitors page
2. Click "New Visitor"
3. Fill form and submit
4. Note: `checkOutTime` is **null** at this point

### Step 2: Check Out the Visitor
1. Find the visitor in the list
2. Click "Start Meeting" (optional)
3. Click "Complete" button
4. **Checkout time is now recorded!**

### Step 3: View Checkout Time
**In UI**: You'll see "Checked out: 3:30 PM" below the status badge

**In Database**: Query to check
```sql
SELECT name, checkInTime, checkOutTime, status 
FROM "Visitor" 
WHERE name = 'Test A';
```

**Result**:
```
name    | checkInTime          | checkOutTime         | status
--------|---------------------|---------------------|----------
Test A  | 2026-03-06 14:45:00 | 2026-03-06 15:30:00 | completed
```

---

## Common Use Cases

### 1. Get Today's Completed Visits
```typescript
const completedToday = await prisma.visitor.findMany({
  where: {
    checkOutTime: {
      gte: new Date(new Date().setHours(0, 0, 0, 0)),
      lte: new Date(new Date().setHours(23, 59, 59, 999))
    },
    status: 'completed'
  }
});
```

### 2. Get Average Visit Duration
```typescript
const visitors = await prisma.visitor.findMany({
  where: { checkOutTime: { not: null } }
});

const totalDuration = visitors.reduce((sum, v) => {
  const duration = new Date(v.checkOutTime!).getTime() - new Date(v.checkInTime).getTime();
  return sum + duration;
}, 0);

const avgDurationMs = totalDuration / visitors.length;
const avgDurationMins = Math.floor(avgDurationMs / (1000 * 60));
console.log(`Average visit duration: ${avgDurationMins} minutes`);
```

### 3. Get Visitors Still in Building
```typescript
const currentVisitors = await prisma.visitor.findMany({
  where: {
    checkOutTime: null,
    status: { in: ['waiting', 'in-meeting', 'active'] }
  }
});
console.log(`${currentVisitors.length} visitors currently in building`);
```

### 4. Export Daily Report
```typescript
const dailyReport = await prisma.visitor.findMany({
  where: {
    checkInTime: {
      gte: new Date(new Date().setHours(0, 0, 0, 0))
    }
  },
  select: {
    name,
    phone,
    purpose,
    checkInTime,
    checkOutTime,
    status,
    hostId
  }
});

// Convert to CSV or Excel
```

---

## API Endpoints Summary

### Get All Visitors (with checkout time)
```http
GET /api/visitors
```
**Response**:
```json
[
  {
    "id": "uuid-123",
    "name": "Test A",
    "phone": "1234567890",
    "purpose": "Consultation",
    "checkInTime": "2026-03-06T14:45:00.000Z",
    "checkOutTime": "2026-03-06T15:30:00.000Z",  ← HERE
    "status": "completed"
  }
]
```

### Checkout Visitor
```http
POST /api/visitors/:id/checkout
```
**Response**:
```json
{
  "id": "uuid-123",
  "checkOutTime": "2026-03-06T15:30:00.000Z",  ← JUST SET
  "status": "completed"
}
```

---

## Summary

✅ **Checkout time is set**: When you click "Complete" or "Convert to Client"
✅ **Checkout time is stored**: In PostgreSQL database, `checkOutTime` column
✅ **Checkout time is displayed**: In Visitors page, below status badge
✅ **Checkout time is nullable**: Can be null if visitor hasn't checked out yet
✅ **Checkout time is automatic**: System records current time when checkout happens

**To see checkout time**: Just click the "Complete" button on any visitor, and you'll see "Checked out: [time]" appear!
