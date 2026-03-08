import { apiClient } from '@/lib/api-client';

export interface IBaseService<T> {
    getAll(): Promise<T[]>;
    getById(id: string): Promise<T>;
    create(data: Omit<T, 'id' | 'createdAt'>): Promise<T>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}

export abstract class BaseApiService<T> implements IBaseService<T> {
    protected abstract endpoint: string;

    async getAll(): Promise<T[]> {
        return apiClient.get<T[]>(this.endpoint);
    }

    async getById(id: string): Promise<T> {
        return apiClient.get<T>(`${this.endpoint}/${id}`);
    }

    async create(data: Omit<T, 'id' | 'createdAt'>): Promise<T> {
        return apiClient.post<T>(this.endpoint, data);
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        return apiClient.patch<T>(`${this.endpoint}/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        return apiClient.delete(`${this.endpoint}/${id}`);
    }
}
