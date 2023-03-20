export function checkFont(font: string, size?: number): boolean{
    if(font.trim().length == 0) return false
    return document.fonts.check(`${size ?? 18}px ${font}`) 
}