const DEFAULT_API_URL = 'https://anime.datatruyen.online';

function getBaseApiUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || DEFAULT_API_URL;
    return apiUrl.replace(/\/$/, '');
}

export function resolveImageUrl(imageUrl?: string) {
    if (!imageUrl) {
        return undefined;
    }

    const trimmedUrl = imageUrl.trim();

    if (!trimmedUrl) {
        return undefined;
    }

    if (/^https?:\/\//i.test(trimmedUrl)) {
        return trimmedUrl;
    }

    if (trimmedUrl.includes('/upload/')) {
        return `${getBaseApiUrl()}${trimmedUrl.substring(trimmedUrl.indexOf('/upload/'))}`;
    }

    return `${getBaseApiUrl()}${trimmedUrl.startsWith('/') ? '' : '/'}${trimmedUrl}`;
}

export function shouldBypassNextImageOptimization(imageUrl?: string) {
    const resolvedUrl = resolveImageUrl(imageUrl);

    if (!resolvedUrl) {
        return false;
    }

    return resolvedUrl.includes('anime.datatruyen.online/upload/');
}
