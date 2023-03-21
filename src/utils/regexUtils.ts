
export function escapeStringForRegExp(string: string): string{
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function concatenateStringsToRegex(strings: string[], modifier?: string): RegExp {
    return new RegExp(strings.join('|'), modifier ?? 'g')
}
