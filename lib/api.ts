export const BASE_URL = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '')
    : 'https://chatsync-backend-w3ut.onrender.com';

const API_URL = `${BASE_URL}/api/v1`;

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;

    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...((options.headers as Record<string, string>) || {})
    };

    // Don't set Content-Type for FormData, the browser will set it with the correct boundary
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        credentials: 'include',
        mode: 'cors',
        ...options,
        headers,
    });

    // Try to parse JSON but handle non-JSON or empty responses
    let data: any = {};
    const text = await response.text();
    try {
        data = text ? JSON.parse(text) : {};
    } catch (err) {
        console.error("Failed to parse API response as JSON:", text);
        data = { message: text || 'Something went wrong' };
    }

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

