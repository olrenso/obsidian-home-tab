import { lucideIcons, type LucideIcon } from "./lucideIcons";
import { getIcon, setIcon } from "obsidian";

interface lucideIconOptions{
    size?: number,
    strokeWidth?: number,
    class?: string,
    ariaLabel?: string,
}

export function getLucideIcon(iconId: LucideIcon, options?: lucideIconOptions): SVGSVGElement | null {
    if (!lucideIcons.includes(iconId)) return null

    const iconEl = getIcon(iconId)
    if(iconEl) {
        const size = options?.size ?? 24
        iconEl.ariaLabel = options?.ariaLabel ?? ''

        if(size !=24 || options?.strokeWidth !=2){
            iconEl.hasClass('svg-icon') ? iconEl.removeClass('svg-icon') : null
        }
        
        options?.class ? iconEl.addClass(options.class) : null
        iconEl.setAttribute('width', size.toString())
        iconEl.setAttribute('height', size.toString())
        iconEl.setAttribute('stroke-width', (options?.strokeWidth ?? 2).toString())
    
        return iconEl
    }
    return null
}

export function addLucideIcon(parentElement: HTMLElement, iconId: LucideIcon, options?: lucideIconOptions): void | null{
    const icon = getLucideIcon(iconId, options)
    if(icon) parentElement.appendChild(icon)
}

interface hotkeySuggestion{
    hotkey: string,
    action: string,
}

export function generateHotkeySuggestion(hotkeySuggestions: hotkeySuggestion[], containerClass: string): HTMLElement{
    const hotkeySuggestionElement = createDiv(containerClass)

    hotkeySuggestions.forEach((hotkeySuggestion) => {
        const suggestionElement = hotkeySuggestionElement.createDiv('prompt-instruction')
        suggestionElement.createEl('span', {text: hotkeySuggestion.hotkey}).addClass('prompt-instruction-command')
        suggestionElement.createEl('span', {text: hotkeySuggestion.action})
    })

    return hotkeySuggestionElement        
}