import express from 'express';
import { prisma } from '../lib/prisma.js';
import { getIO } from '../socket.js';

const router = express.Router();

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve an array of department names to Department DB records.
 * Returns only those that actually exist.
 */
async function resolveDepartments(deptNames: string[]) {
  if (!deptNames || deptNames.length === 0) return [];
  return prisma.department.findMany({
    where: { name: { in: deptNames } },
    select: { id: true, name: true },
  });
}

// ─── GET all employees ────────────────────────────────────────────────────────
router.post('/list', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        departmentMemberships: {
          include: { department: { select: { id: true, name: true } } },
        },
      },
    });

    // Shape: attach departments[] array for frontend convenience
    const shaped = employees.map((e) => ({
      ...e,
      departments: e.departmentMemberships.map((m) => m.department.name),
      departmentMemberships: undefined, // strip raw relation
    }));

    res.json(shaped);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── CREATE employee ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      name, email, phone, mobile, role, status, avatarUrl,
      department,      // single (legacy / primary)
      departments = [], // multi-department array (new)
    } = req.body;

    // Merge: primary dept goes into the array too (deduped)
    const allDeptNames: string[] = Array.from(
      new Set([
        ...(departments as string[]),
        ...(department ? [department] : []),
      ])
    ).filter(Boolean);

    // Primary department = first in the merged list
    const primaryDept = allDeptNames[0] ?? null;

    // Resolve dept names → DB ids (atomic transaction)
    const [newEmployee] = await prisma.$transaction(async (tx) => {
      const emp = await tx.employee.create({
        data: {
          name,
          email: email ?? null,
          phone: phone ?? null,
          mobile: mobile ?? null,
          role,
          department: primaryDept,        // backward-compat single field
          departments: allDeptNames,       // full array
          status: status ?? 'active',
          avatarUrl: avatarUrl ?? null,
        },
      });

      // Create junction rows if departments were specified
      if (allDeptNames.length > 0) {
        const deptRecords = await tx.department.findMany({
          where: { name: { in: allDeptNames } },
          select: { id: true, name: true },
        });

        if (deptRecords.length > 0) {
          await tx.employeeDepartment.createMany({
            data: deptRecords.map((d) => ({
              employeeId: emp.id,
              departmentId: d.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      return [emp];
    });

    // ── Real-time: emit EMPLOYEE_CREATED ───────────────────────────────────
    try {
      const io = getIO();
      const payload = {
        employee: { ...newEmployee, departments: allDeptNames },
        departments: allDeptNames,
        createdAt: new Date().toISOString(),
        message: `${name} joined as ${role}${primaryDept ? ` in ${primaryDept}` : ''}`,
      };
      io.emit('EMPLOYEE_CREATED', payload);

      // Also fire per-department events
      for (const deptName of allDeptNames) {
        io.emit('EMPLOYEE_ASSIGNED_TO_DEPARTMENT', {
          employeeId: newEmployee.id,
          employeeName: name,
          department: deptName,
          role,
        });
      }
    } catch { /* non-fatal */ }

    res.status(201).json({ ...newEmployee, departments: allDeptNames });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── UPDATE employee ──────────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      departments,
      department,
      ...rest
    } = req.body;

    const allDeptNames: string[] | undefined =
      departments !== undefined
        ? Array.from(
            new Set([
              ...(departments as string[]),
              ...(department ? [department] : []),
            ])
          ).filter(Boolean)
        : undefined;

    const primaryDept =
      allDeptNames !== undefined
        ? allDeptNames[0] ?? null
        : department ?? undefined;

    const [updatedEmployee] = await prisma.$transaction(async (tx) => {
      const emp = await tx.employee.update({
        where: { id },
        data: {
          ...rest,
          ...(primaryDept !== undefined && { department: primaryDept }),
          ...(allDeptNames !== undefined && { departments: allDeptNames }),
        },
      });

      // Replace junction rows only if departments were explicitly passed
      if (allDeptNames !== undefined) {
        // Remove existing
        await tx.employeeDepartment.deleteMany({ where: { employeeId: id } });

        if (allDeptNames.length > 0) {
          const deptRecords = await tx.department.findMany({
            where: { name: { in: allDeptNames } },
            select: { id: true },
          });
          if (deptRecords.length > 0) {
            await tx.employeeDepartment.createMany({
              data: deptRecords.map((d) => ({
                employeeId: id,
                departmentId: d.id,
              })),
              skipDuplicates: true,
            });
          }
        }
      }

      return [emp];
    });

    res.json({ ...updatedEmployee, departments: allDeptNames ?? [updatedEmployee.department].filter(Boolean) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET employee by ID ───────────────────────────────────────────────────────
router.post('/details/:id', async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        departmentMemberships: {
          include: { department: { select: { id: true, name: true } } },
        },
      },
    });
    if (!employee) return res.status(404).json({ error: 'Employee not found' });

    res.json({
      ...employee,
      departments: employee.departmentMemberships.map((m) => m.department.name),
      departmentMemberships: undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─── DELETE employee ──────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    // Junction rows cascade-deleted by FK constraint
    const employee = await prisma.employee.delete({ where: { id: req.params.id } });
    res.json(employee);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
