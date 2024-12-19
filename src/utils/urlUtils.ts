export function isValidUrl(url: string): boolean {
    // 移除前后空格
    url = url.trim();

    // 如果 URL 太短，直接返回 false
    if (url.length < 3) return false;

    // 如果已经是完整的 URL，直接验证
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // 如果包含常见的顶级域名，很可能是一个 URL
    const commonTlds = [
        // 通用顶级域名
        '.com', '.org', '.net', '.edu', '.gov', '.io', '.so', '.vip', '.top', '.xyz', '.info', '.me',
        // 国家和地区顶级域名
        '.cn', '.com.cn', '.org.cn', '.net.cn', '.gov.cn', '.edu.cn',
        '.hk', '.tw', '.jp', '.kr', '.uk', '.de', '.fr', '.ru', '.br', '.in'
    ];
    if (commonTlds.some(tld => url.toLowerCase().includes(tld))) {
        try {
            new URL('https://' + url);
            return true;
        } catch {
            return false;
        }
    }

    // 如果包含域名分隔符，也可能是一个 URL
    if (url.includes('.') && !url.startsWith('.') && !url.endsWith('.')) {
        try {
            new URL('https://' + url);
            return true;
        } catch {
            return false;
        }
    }

    return false;
}

export function ensureHttps(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return 'https://' + url;
    }
    return url;
}
