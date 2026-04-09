const DEFAULT_API_URL = 'https://anime.datatruyen.online';

export function getExternalApiBaseUrl() {
    return (process.env.API_URL || DEFAULT_API_URL).replace(/\/$/, '');
}

export function getExternalApiHeaders(headers?: HeadersInit) {
    const mergedHeaders = new Headers(headers);
    const masterSyncApiKey = process.env.MASTER_SYNC_API_KEY?.trim();

    if (!mergedHeaders.has('Content-Type')) {
        mergedHeaders.set('Content-Type', 'application/json');
    }

    if (masterSyncApiKey) {
        mergedHeaders.set('X-API-Key', masterSyncApiKey);
    }

    return mergedHeaders;
}

export async function fetchExternalApi(path: string, init?: RequestInit) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return fetch(`${getExternalApiBaseUrl()}${normalizedPath}`, {
        ...init,
        headers: getExternalApiHeaders(init?.headers),
    });
}
