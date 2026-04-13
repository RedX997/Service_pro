# Visitor Status Flow - Complete Explanation

## How Visitor Status Works

Your visitor management system has **5 different statuses** that track the visitor's journey from arrival to completion.

## Status Types

### 1. **Waiting** 🟡
- **When it's set**: When you first register a new visitor
- **What it means**: Visitor has checked in and is waiting in the reception area
- **Color**: Yellow/Warning color
- **Database value**: `status: 'waiting'`

### 2. **In-Meeting** 🔵  
- **When it's set**: When receptionist clicks "Start Meeting" button
- **What it means**: Visitor is currently in a meeting with the assigned person
- **Color**: Blue/Accent color
- **Database value**: `status: 'in-meeting'`

### 3. **Active** 🟢
- **When it's set**: Default status in database schema
- **What it means**: Visitor is currently active in the system
- **Color**: Green/Primary color
- **Database value**: `status: 'active'`

### 4. **Completed** ✅
- **When it's set**: When receptionist clicks "Complete" button (check out)
- **What it means**: Meeting is finished, visitor has left
- **Color**: Green/Success color
- **Database value**: `status: 'completed'`
- **Also sets**: `checkOutTime` field with current timestamp

### 5. **Converted** 🎯
- **When it's set**: When visitor is converted to a client
- **What it means**: Visitor became a paying client
- **Color**: Purple/Primary color
- **Database value**: `status: 'converted'`

---

## Complete Visitor Journey Flow

```
Step 1: REGISTER VISITOR
├─ Receptionist clicks "New Visitor" button
├─ Fills form: Name, Mobile, Purpose, Assign To, Notes
├─ Clicks "Register Visitor"
└─ Status automatically set to: "waiting"

Step 2: START MEETING
├─ Receptionist finds visitor in list
├─ Clicks "Start Meeting" button
└─ Status changes to: "in-meeting"

Step 3A: COMPLETE MEETING (Normal flow)
├─ Receptionist clicks "Complete" button
├─ Status changes to: "completed"
└─ checkOutTime is recorded

Step 3B: CONVERT TO CLIENT (Sales flow)
├─ Receptionist clicks "Convert to Client" button
├─ Fills client details form
├─ Status changes to: "converted"
└─ New client record is created in database
```

---

## Where Status is Stored

### Database Table: `Visitor`
```sql
CREATE TABLE Visitor (
  id           UUID PRIMARY KEY,
  name         VARCHAR,
  phone        VARCHAR,
  purpose      TEXT,
  hostId       VARCHAR,
  checkInTime  TIMESTAMP DEFAULT NOW(),
  checkOutTime TIMESTAMP,
  status       VARCHAR DEFAULT 'active',  ← STATUS STORED HERE
  notes        TEXT,
  createdAt    TIMESTAMP DEFAULT NOW()
)
```

### Prisma Schema:
```prisma
model Visitor {
  id           String    @id @default(uuid())
  name         String
  phone        String?
  purpose      String
  hostId       String?
  checkInTime  DateTime  @default(now())
  checkOutTime DateTime?
  status       String    @default("active")  ← STATUS FIELD
  notes        String?
  createdAt    DateTime  @default(now())
}
```

---

## How Status is Changed

### 1. When Adding New Visitor
**File**: `src/pages/Visitors.tsx`
**Function**: `handleAddVisitor()`

```typescript
await createVisitorMutation.mutateAsync({
  name: visitorForm.name,
  phone: visitorForm.mobile,
  purpose: visitorForm.purpose,
  hostId: visitorForm.assignedTo,
  notes: visitorForm.notes,
  status: 'waiting',  ← SET TO WAITING
});
```

### 2. When Starting Meeting
**File**: `src/pages/Visitors.tsx`
**Function**: `handleStatusChange()`

```typescript
// Receptionist clicks "Start Meeting" button
await updateVisitorMutation.mutateAsync({
  id: visitor.id,
  updates: { status: 'in-meeting' }  ← CHANGE TO IN-MEETING
});
```

### 3. When Completing Visit
**File**: `src/pages/Visitors.tsx`
**Function**: `handleCheckOut()`

```typescript
// Receptionist clicks "Complete" button
await checkOutVisitorMutation.mutateAsync(visitor.id);
// This sets status to 'completed' AND records checkOutTime
```

### 4. When Converting to Client
**File**: `src/pages/Visitors.tsx`
**Function**: `confirmConvertToClient()`

```typescript
// Receptionist clicks "Convert to Client" button
await convertToClientMutation.mutateAsync({
  id: convertingVisitor.id,
  clientData: { ...clientForm }
});
// This sets status to 'converted' AND creates new client
```

---

## How Status is Displayed

### Status Configuration
**File**: `src/pages/Visitors.tsx`

```typescript
const statusConfig = {
  active: { 
    label: 'Active', 
    className: 'bg-primary/10 text-primary border-primary/20' 
  },
  waiting: { 
    label: 'Waiting', 
    className: 'bg-warning/10 text-warning border-warning/20' 
  },
  'in-meeting': { 
    label: 'In Meeting', 
    className: 'bg-accent/10 text-accent border-accent/20' 
  },
  completed: { 
    label: 'Completed', 
    className: 'bg-success/10 text-success border-success/20' 
  },
  converted: { 
    label: 'Converted', 
    className: 'bg-primary/10 text-primary border-primary/20' 
  },
};
```

### Display in UI
```typescript
<Badge className={cn(statusConfig[visitor.status].className)}>
  {statusConfig[visitor.status].label}
</Badge>
```

---

## Backend API Endpoints

### 1. Create Visitor (POST /api/visitors)
```typescript
// Sets initial status to 'waiting'
const visitor = await prisma.visitor.create({
  data: {
    name,
    phone,
    purpose,
    hostId,
    status: 'waiting',
    checkInTime: new Date()
  }
});
```

### 2. Update Status (PATCH /api/visitors/:id)
```typescript
// Updates status to any value
const visitor = await prisma.visitor.update({
  where: { id },
  data: { status: newStatus }
});
```

### 3. Check Out (POST /api/visitors/:id/checkout)
```typescript
// Sets status to 'completed' and records checkout time
const visitor = await prisma.visitor.update({
  where: { id },
  data: {
    status: 'completed',
    checkOutTime: new Date()
  }
});
```

### 4. Convert to Client (POST /api/visitors/:id/convert)
```typescript
// Sets status to 'converted' and creates client
const visitor = await prisma.visitor.update({
  where: { id },
  data: { status: 'converted' }
});

const client = await prisma.client.create({
  data: clientData
});
```

---

## Dashboard Display Logic

### RecentVisitors Component
**File**: `src/components/dashboard/RecentVisitors.tsx`

```typescript
// Filters visitors by today's date
const todayVisitors = useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return allVisitors
    .filter(v => {
      const checkInDate = new Date(v.checkInTime);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    })
    .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
    .slice(0, 4); // Show only 4 most recent
}, [allVisitors]);
```

**Status Badge Display**:
```typescript
<Badge className={cn(statusStyles[visitor.status])}>
  {statusLabels[visitor.status] || visitor.status}
</Badge>
```

---

## Example: Adding Visitor "test a"

### Step-by-Step Process:

1. **You go to Visitors page**
2. **Click "New Visitor" button**
3. **Fill the form**:
   - Name: "test a"
   - Mobile: "1234567890"
   - Purpose: "Consultation"
   - Assign To: "Ankit Sharma"
4. **Click "Register Visitor"**

### What Happens in Code:

```typescript
// Frontend sends request
await createVisitorMutation.mutateAsync({
  name: "test a",
  phone: "1234567890",
  purpose: "Consultation",
  hostId: "Ankit Sharma",
  status: 'waiting'  ← AUTOMATICALLY SET
});

// Backend saves to database
INSERT INTO "Visitor" (
  id, name, phone, purpose, hostId, 
  status, checkInTime, createdAt
) VALUES (
  'uuid-123', 'test a', '1234567890', 'Consultation', 
  'Ankit Sharma', 'waiting', NOW(), NOW()
);

// Dashboard fetches all visitors
SELECT * FROM "Visitor" WHERE DATE(checkInTime) = TODAY();

// Your visitor appears with yellow "Waiting" badge
```

---

## Summary

✅ **Status is stored in**: PostgreSQL database, `Visitor` table, `status` column
✅ **Status is set by**: Receptionist clicking buttons in Visitors page
✅ **Status is displayed in**: Visitors page (main list) and Dashboard (RecentVisitors component)
✅ **Status changes automatically**: When you click action buttons
✅ **Status persists**: Saved in database, survives page refresh

Your visitor "test a" has status "waiting" because that's the default status when registering a new visitor!
