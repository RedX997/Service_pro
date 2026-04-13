import { prisma } from '../lib/prisma.js';

/**
 * Action types for client activity logging
 */
export enum ClientActivityAction {
  CLIENT_CREATED = 'CLIENT_CREATED',
  CLIENT_UPDATED = 'CLIENT_UPDATED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  EMPLOYEE_ASSIGNED = 'EMPLOYEE_ASSIGNED',
  EMPLOYEE_UNASSIGNED = 'EMPLOYEE_UNASSIGNED',
  SERVICE_ADDED = 'SERVICE_ADDED',
  SERVICE_REMOVED = 'SERVICE_REMOVED',
  VISITOR_ENTERED = 'VISITOR_ENTERED',
  VISITOR_EXITED = 'VISITOR_EXITED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  CLIENT_DELETED = 'CLIENT_DELETED'
}

/**
 * Options for logging client activity
 */
export interface LogClientActivityOptions {
  clientId: string;
  performedBy: number;
  action: ClientActivityAction | string;
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Log a client activity to the audit trail
 * 
 * This function creates an immutable record of every action performed on a client.
 * It's called from various route handlers to maintain a complete audit trail.
 * 
 * @param options - Activity logging options
 * @returns The created activity log entry
 * 
 * @example
 * // Log client creation
 * await logClientActivity({
 *   clientId: client.id,
 *   performedBy: req.user.id,
 *   action: ClientActivityAction.CLIENT_CREATED,
 *   description: `Client ${client.name} was created`,
 *   metadata: { initialStatus: client.status, assignedTo: client.assignedEmployee }
 * });
 * 
 * @example
 * // Log employee assignment
 * await logClientActivity({
 *   clientId: client.id,
 *   performedBy: req.user.id,
 *   action: ClientActivityAction.EMPLOYEE_ASSIGNED,
 *   description: `Assigned to ${newEmployee.name}`,
 *   metadata: { 
 *     previousAssignee: oldEmployee?.name,
 *     newAssignee: newEmployee.name,
 *     previousAssigneeId: oldClient.assignedEmployee,
 *     newAssigneeId: newClient.assignedEmployee
 *   }
 * });
 */
export async function logClientActivity(options: LogClientActivityOptions) {
  const { clientId, performedBy, action, description, metadata } = options;

  try {
    // Validate required fields
    if (!clientId) {
      throw new Error('clientId is required for activity logging');
    }
    if (!performedBy) {
      throw new Error('performedBy (user ID) is required for activity logging');
    }
    if (!action) {
      throw new Error('action is required for activity logging');
    }
    if (!description) {
      throw new Error('description is required for activity logging');
    }

    // Create activity log entry
    const activityLog = await prisma.clientActivityLog.create({
      data: {
        clientId,
        performedBy,
        action,
        description,
        metadata: metadata || {}
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: {
              select: {
                role_name: true
              }
            }
          }
        },
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log(`✅ Activity logged: ${action} for client ${clientId} by user ${performedBy}`);
    
    return activityLog;
  } catch (error) {
    console.error('❌ Error logging client activity:', error);
    // Don't throw - we don't want activity logging failures to break the main operation
    // Just log the error and continue
    return null;
  }
}

/**
 * Helper function to compare two objects and generate a description of changes
 * Useful for CLIENT_UPDATED actions
 */
export function generateUpdateDescription(
  oldData: Record<string, any>,
  newData: Record<string, any>,
  fieldLabels: Record<string, string> = {}
): { description: string; metadata: Record<string, any> } {
  const changes: string[] = [];
  const metadata: Record<string, any> = { changes: [] };

  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      const label = fieldLabels[key] || key;
      changes.push(`${label} changed`);
      metadata.changes.push({
        field: key,
        fieldLabel: label,
        oldValue: oldData[key],
        newValue: newData[key]
      });
    }
  }

  const description = changes.length > 0 
    ? changes.join(', ') 
    : 'Client information updated';

  return { description, metadata };
}

/**
 * Helper to get employee name by ID
 */
export async function getEmployeeName(employeeId: string | null): Promise<string | null> {
  if (!employeeId) return null;
  
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { name: true }
    });
    return employee?.name || null;
  } catch (error) {
    console.error('Error fetching employee name:', error);
    return null;
  }
}
