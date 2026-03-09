/**
 * Type-Safe API Client
 * ==============================================================================
 * Unified client for making API requests with type safety.
 * Handles error parsing automatically.
 * ==============================================================================
 */

import { SecretSajuError } from '@/lib/contracts/errors';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRequestOptions extends RequestInit {
    json?: any;
    params?: Record<string, string>;
}

export class ApiClient {
    private static baseUrl = '/api';

    private static async request<T>(endpoint: string, method: HttpMethod, options: ApiRequestOptions = {}): Promise<T> {
        const { json, params, headers, ...customConfig } = options;

        // Build URL with query params
        let url = `${this.baseUrl}${endpoint}`;
        if (params) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }

        // Default headers
        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            ...customConfig,
        };

        // Add JSON body
        if (json) {
            config.body = JSON.stringify(json);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Handle standardized API error response
                if (data.error) {
                    throw new SecretSajuError(
                        data.error.message || 'Unknown error occurred',
                        data.error.code || 'UNKNOWN_ERROR',
                        response.status,
                        data.error.details
                    );
                }

                throw new Error(response.statusText);
            }

            return data as T;
        } catch (error) {
            // Re-throw SecretSajuErrors as-is
            if (error instanceof SecretSajuError) {
                throw error;
            }

            // Wrap network/parsing errors
            throw new SecretSajuError(
                error instanceof Error ? error.message : 'Network request failed',
                'NETWORK_ERROR',
                0
            );
        }
    }

    /**
     * GET request
     */
    static get<T>(endpoint: string, params?: Record<string, string>, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, 'GET', { params, ...options });
    }

    /**
     * POST request
     */
    static post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, 'POST', { json: body, ...options });
    }

    /**
     * PUT request
     */
    static put<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, 'PUT', { json: body, ...options });
    }

    /**
     * DELETE request
     */
    static delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
        return this.request<T>(endpoint, 'DELETE', options);
    }
}
