import { LocalStorage } from '@/lib/storage';
import { IBaseService } from './base-service';

export class MockService<T extends { id: string; createdAt: Date }> implements IBaseService<T> {
    constructor(private storageKey: string, private initialData: T[]) { }

    private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    async getAll(): Promise<T[]> {
        await this.delay(300);
        return LocalStorage.get(this.storageKey, this.initialData);
    }

    async getById(id: string): Promise<T> {
        await this.delay(300);
        const data = await this.getAll();
        const item = data.find(i => i.id === id);
        if (!item) throw new Error('Item not found');
        return item;
    }

    async create(data: Omit<T, 'id' | 'createdAt'>): Promise<T> {
        await this.delay(500);
        const list = await this.getAll();
        const newItem = {
            ...data,
            id: Date.now().toString(),
            createdAt: new Date(),
        } as unknown as T;
        LocalStorage.set(this.storageKey, [...list, newItem]);
        return newItem;
    }

    async update(id: string, updates: Partial<T>): Promise<T> {
        await this.delay(500);
        const list = await this.getAll();
        const index = list.findIndex(i => i.id === id);
        if (index === -1) throw new Error('Item not found');

        const updatedItem = { ...list[index], ...updates };
        list[index] = updatedItem;
        LocalStorage.set(this.storageKey, list);
        return updatedItem;
    }

    async delete(id: string): Promise<void> {
        await this.delay(300);
        const list = await this.getAll();
        LocalStorage.set(this.storageKey, list.filter(i => i.id !== id));
    }
}
