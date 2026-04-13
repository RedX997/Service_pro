import { Client, Employee, Visitor, Message, TimeEntry, ActiveTimer } from '@/types';
import { STORAGE_KEYS } from '@/lib/storage';
import { initialClients, employees as initialEmployees, initialVisitors, initialMessages, initialTimeEntries } from '@/lib/data';
import { MockService } from './mock-service';
import { BaseApiService, IBaseService } from './base-service';
import { apiClient } from '@/lib/api-client';
import { LocalStorage } from '@/lib/storage';

// Feature flag for using real API
const USE_API = import.meta.env.VITE_USE_API === 'true';

interface IClientService extends IBaseService<Client> {
    getAllActivity(limit?: number): Promise<any[]>;
}

class ClientApiService extends BaseApiService<Client> implements IClientService {
    protected endpoint = '/clients';

    // Converted to POST (PUSH)
    async getAllActivity(limit: number = 10): Promise<any[]> {
        return apiClient.post(`${this.endpoint}/all-activity?limit=${limit}`, {});
    }
}

class ClientMockService extends MockService<Client> implements IClientService {
    async getAllActivity(limit: number = 10): Promise<any[]> {
        return []; // Mocks don't have global activity logs currently
    }
}

class EmployeeApiService extends BaseApiService<Employee> {
    protected endpoint = '/employees';
}

interface IVisitorService extends IBaseService<Visitor> {
    checkOut(id: string): Promise<Visitor>;
    convertToClient(id: string, clientData: any): Promise<{ visitor: Visitor; clientId: string }>;
}

class VisitorApiService extends BaseApiService<Visitor> implements IVisitorService {
    protected endpoint = '/visitors';

    async checkOut(id: string): Promise<Visitor> {
        return (await apiClient.post(`${this.endpoint}/${id}/checkout`, {}));
    }

    async convertToClient(id: string, clientData: any): Promise<{ visitor: Visitor; clientId: string }> {
        return (await apiClient.post(`${this.endpoint}/${id}/convert`, clientData));
    }
}

class VisitorMockService extends MockService<Visitor> implements IVisitorService {
    async checkOut(id: string): Promise<Visitor> {
        return this.update(id, {
            checkOutTime: new Date(),
            status: 'completed' as const
        } as Partial<Visitor>);
    }

    async convertToClient(id: string, clientData: any): Promise<{ visitor: Visitor; clientId: string }> {
        const visitor = await this.update(id, {
            status: 'converted' as const,
            checkOutTime: new Date()
        } as Partial<Visitor>);

        // Manual client creation (simplified for mock)
        const list = LocalStorage.get(STORAGE_KEYS.CLIENTS, []);
        const newClient = {
            ...clientData,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        LocalStorage.set(STORAGE_KEYS.CLIENTS, [...list, newClient]);

        return { visitor, clientId: newClient.id };
    }
}

interface IMessageService extends IBaseService<Message> {
    markAsRead(id: string): Promise<Message>;
}

class MessageApiService extends BaseApiService<Message> implements IMessageService {
    protected endpoint = '/messages';

    async markAsRead(id: string): Promise<Message> {
        return (await apiClient.patch(`${this.endpoint}/${id}/read`, {}));
    }
}

class MessageMockService extends MockService<Message> implements IMessageService {
    async markAsRead(id: string): Promise<Message> {
        return this.update(id, { isRead: true } as Partial<Message>);
    }
}

interface ITimeTrackingService extends IBaseService<TimeEntry> {
    getActiveTimer(employeeId: string): Promise<ActiveTimer | null>;
    startTimer(timer: Omit<ActiveTimer, 'id' | 'startTime' | 'createdAt'>): Promise<ActiveTimer>;
    stopTimer(employeeId: string, notes?: string): Promise<TimeEntry>;
}

class TimeTrackingApiService extends BaseApiService<TimeEntry> implements ITimeTrackingService {
    protected endpoint = '/time-entries';

    async getActiveTimer(employeeId: string): Promise<ActiveTimer | null> {
        // Converted to POST (PUSH)
        return apiClient.post<ActiveTimer | null>(`${this.endpoint}/active/${employeeId}`, {});
    }

    async startTimer(timer: Omit<ActiveTimer, 'id' | 'startTime' | 'createdAt'>): Promise<ActiveTimer> {
        return apiClient.post<ActiveTimer>(`${this.endpoint}/start`, timer);
    }

    async stopTimer(employeeId: string, notes?: string): Promise<TimeEntry> {
        return apiClient.post<TimeEntry>(`${this.endpoint}/stop`, { employeeId, notes });
    }
}

class TimeTrackingMockService extends MockService<TimeEntry> implements ITimeTrackingService {
    private activeKey = `${this['storageKey']}_active`;

    async getActiveTimer(employeeId: string): Promise<ActiveTimer | null> {
        const activeTimers = LocalStorage.get(this.activeKey, []);
        const timer = activeTimers.find((t: any) => t.employeeId === employeeId);
        return timer ? { ...timer, startTime: new Date(timer.startTime) } : null;
    }

    async startTimer(timer: Omit<ActiveTimer, 'id' | 'startTime' | 'createdAt'>): Promise<ActiveTimer> {
        const activeTimers = LocalStorage.get(this.activeKey, []);
        const filtered = activeTimers.filter((t: any) => t.employeeId !== timer.employeeId);
        const newTimer: ActiveTimer = {
            ...timer,
            id: Date.now().toString(),
            startTime: new Date(),
            createdAt: new Date(),
        };
        LocalStorage.set(this.activeKey, [...filtered, newTimer]);
        return newTimer;
    }

    async stopTimer(employeeId: string, notes?: string): Promise<TimeEntry> {
        const activeTimers = LocalStorage.get(this.activeKey, []);
        const timer = activeTimers.find((t: any) => t.employeeId === employeeId);
        if (!timer) throw new Error('No active timer found');

        const startTime = new Date(timer.startTime);
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        const entry = await this.create({
            employeeId: timer.employeeId,
            clientId: timer.clientId,
            serviceId: timer.serviceId,
            startTime,
            endTime,
            duration,
            notes: notes || timer.notes,
        } as any);

        LocalStorage.set(this.activeKey, activeTimers.filter((t: any) => t.employeeId !== employeeId));
        return entry;
    }
}

export const clientService: IClientService = USE_API
    ? new ClientApiService()
    : new ClientMockService(STORAGE_KEYS.CLIENTS, initialClients);

export const employeeService = USE_API
    ? new EmployeeApiService()
    : new MockService<Employee>(STORAGE_KEYS.EMPLOYEES, initialEmployees.map(emp => ({
        ...emp,
        status: 'active' as const,
        createdAt: new Date(),
    })));

export const visitorService = USE_API
    ? new VisitorApiService()
    : new VisitorMockService(STORAGE_KEYS.VISITORS, initialVisitors.map(v => ({
        ...v,
        createdAt: v.checkInTime || new Date(),
    })));

export const messageService = USE_API
    ? new MessageApiService()
    : new MessageMockService(STORAGE_KEYS.MESSAGES, initialMessages.map(m => ({
        ...m,
        createdAt: m.timestamp || new Date(),
    })));

export const timeTrackingService = USE_API
    ? new TimeTrackingApiService()
    : new TimeTrackingMockService(STORAGE_KEYS.TIME_ENTRIES, initialTimeEntries.map(e => ({
        ...e,
        createdAt: e.startTime || new Date(),
    })));
export { apiClient };
