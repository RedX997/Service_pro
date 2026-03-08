import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
    private instance: AxiosInstance;

    constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || '/api') {
        this.instance = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        this.initializeInterceptors();
    }

    private initializeInterceptors() {
        this.instance.interceptors.response.use(
            (response) => response,
            (error) => {
                // Global error handling
                console.error('API Error:', error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.get(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.post(url, data, config);
        return response.data;
    }

    public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.put(url, data, config);
        return response.data;
    }

    public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.patch(url, data, config);
        return response.data;
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.instance.delete(url, config);
        return response.data;
    }
}

export const apiClient = new ApiClient();
