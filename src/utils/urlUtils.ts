export function isValidUrl(url: string): boolean {
    // 如果已经是完整的 URL，直接验证
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // 如果不是完整的 URL，尝试添加 https:// 前缀再验证
    try {
        new URL('https://' + url);
        return true;
    } catch {
        return false;
    }
}

export function ensureHttps(url: string): string {
    return url.startsWith('http') ? url : 'https://' + url;
}
