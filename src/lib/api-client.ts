import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiClient {
    private instance: AxiosInstance;

    constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api') {
        console.log('API Client initialized with baseURL:', baseURL);
        
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
        this.instance.interceptors.request.use(
            (config) => {
                console.log('API Request:', config.method?.toUpperCase(), config.url);
                
                // Add user ID to headers for server-side auth
                try {
                    const storedUser = localStorage.getItem('servicepro_auth_user');
                    if (storedUser) {
                        const user = JSON.parse(storedUser);
                        if (user && user.id) {
                            config.headers['x-user-id'] = user.id.toString();
                        }
                    }
                } catch (e) {
                    console.error('Error adding x-user-id header:', e);
                }
                
                return config;
            },
            (error) => {
                console.error('Request Error:', error);
                return Promise.reject(error);
            }
        );

        this.instance.interceptors.response.use(
            (response) => {
                console.log('API Response:', response.status, response.config.url);
                return response;
            },
            (error) => {
                // Global error handling
                console.error('API Error:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    message: error.response?.data || error.message
                });
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
