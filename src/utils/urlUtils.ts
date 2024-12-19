export function isValidUrl(urlString: string): boolean {
    try {
        // 移除前后空格
        urlString = urlString.trim();
        console.log('isValidUrl - testing URL:', urlString);
        
        // 检查基本的 URL 模式，允许更多的 TLD
        const urlPattern = /^((http|https):\/\/)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?(\/[^\s]*)?$/;
        
        // 直接测试输入
        if (urlPattern.test(urlString)) {
            console.log('isValidUrl - URL pattern matched');
            return true;
        }
        
        // 如果输入不包含协议，添加 https:// 再试一次
        if (!urlString.startsWith('http')) {
            const withHttps = 'https://' + urlString;
            if (urlPattern.test(withHttps)) {
                console.log('isValidUrl - URL valid with https');
                return true;
            }
        }
        
        console.log('isValidUrl - URL invalid');
        return false;
    } catch (err) {
        console.error('isValidUrl - Error:', err);
        return false;
    }
}

export function ensureHttps(url: string): string {
    return url.startsWith('http') ? url : 'https://' + url;
}
