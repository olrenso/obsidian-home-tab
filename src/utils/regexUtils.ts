
export function escapeStringForRegExp(string: string): string{
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function concatenateStringsToRegex(strings: string[]): RegExp {
    return new RegExp(strings.join('|'), "g")
}
