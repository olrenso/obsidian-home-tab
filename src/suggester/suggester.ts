// Inspired from @liamcain periodic notes suggest: https://github.com/liamcain/obsidian-periodic-notes/blob/main/src/ui/suggest.ts

import { debounce, Platform, Scope, type App } from 'obsidian'
import suggesterView from '../ui/suggesterView.svelte'
import { createPopper, type Instance as PopperInstance } from '@popperjs/core';
import { get, writable, type Writable } from 'svelte/store';
import type { SvelteComponent } from 'svelte';

/**
 * @param containerClass The class of the suggestion list container.
 * @param suggestionClass Class of the suggestion list, if not given will be used the obsidian default 'suggestion'
 * @param additionalClasses Additional suggestion list classes.
 * @param style The style of the suggestion list, usefull to implement variables.
 * @param additionalModalInfo HTMLelement to render under suggestion items.
 */
export interface suggesterViewOptions{
    isScrollable?: boolean
    containerClass?: string
    suggestionClass?: string
    additionalClasses?: string
    style?: string
    additionalModalInfo?: HTMLElement
    // additionalComponent?: typeof SvelteComponent
    // additionalComponentProps?: []
}

interface ISuggester{
    getSuggestions: Function
    useSelectedItem: Function
    getDisplayElementProps: Function
    scrollSelectedItemIntoView: Function
    onNoSuggestion: Function
}

export class Suggester<T>{
    private ISuggester: ISuggester
    private suggestions: T[]
    private selectedItemIndex: number
    suggestionsContainer: Writable<HTMLElement>
    suggestionsStore: Writable<T[]>
    selectedItemIndexStore: Writable<number>

    constructor(ISuggester: ISuggester, scope: Scope){
        this.ISuggester = ISuggester

        // Svelte store variables
        this.suggestionsStore = writable()
        this.selectedItemIndexStore = writable()
        this.suggestionsContainer = writable()

        this.selectedItemIndexStore.subscribe((value) => this.selectedItemIndex = value)
        this.suggestionsStore.subscribe((value) => this.suggestions = value)

        this.setSuggestions([])
        this.setSelectedItemIndex(0)

        scope.register([], 'ArrowUp', (e) => {
            e.preventDefault()
            this.setSelectedItemIndex(this.selectedItemIndex - 1)
            this.ISuggester.scrollSelectedItemIntoView()
        })
        scope.register([], 'ArrowDown', (e) => {
            e.preventDefault()
            this.setSelectedItemIndex(this.selectedItemIndex + 1)
            this.ISuggester.scrollSelectedItemIntoView()
        })
        scope.register([], 'Enter', (e) => {
            e.preventDefault()
            this.ISuggester.useSelectedItem(this.getSelectedItem())
        })
    }

    setSuggestions(suggestions: T[]){
        this.selectedItemIndexStore.set(0) // Reset selected item to the first result
        this.suggestionsStore.set(suggestions) // Update suggestions list
    }
    getSuggestions(): T[]{
        return this.suggestions
    }
    getSelectedItem(): T{
        return this.suggestions[this.selectedItemIndex]
    }
    getSelectedItemIndex(): number{
        return this.selectedItemIndex
    }
    getSuggestionByIndex(index: number): T{
        return this.suggestions[index]
    }
    setSelectedItemIndex(newIndex: number): void{
        if (newIndex >= this.suggestions.length){
            this.selectedItemIndexStore.set(0)
        }
        else if (newIndex < 0){
            this.selectedItemIndexStore.set(this.suggestions.length - 1)
        }
        else{
            this.selectedItemIndexStore.set(newIndex)
        }
    }
}

export abstract class TextInputSuggester<T> implements ISuggester{
    protected app: App
    protected inputEl: HTMLInputElement
    
    protected suggestionParentContainer: HTMLElement
    protected suggestionContainer: HTMLElement
    protected suggesterView: suggesterView | undefined

    protected scope: Scope
    protected viewOptions: suggesterViewOptions
    
    protected suggester: Suggester<T>

    protected additionalCleaning(): void{}
    protected onOpen(): void{}
    protected onClose(): void{}

    protected displayedSuggestions: boolean
    
    protected closingAnimationTimeout: NodeJS.Timeout
    protected closingAnimationRunning: boolean

    private inputListener: (this: HTMLInputElement, ev: Event) => any

    constructor(app: App, inputEl: HTMLInputElement, suggestionParentContainer: HTMLElement, viewOptions?: suggesterViewOptions, searchDelay?: number){
        this.app = app
        this.inputEl = inputEl
        this.scope = new Scope(this.app.scope)
        
        this.suggester = new Suggester(this, this.scope)
        
        this.inputListener = searchDelay ? debounce(async () => await this.onInput(), searchDelay , false) : this.onInput.bind(this)
        this.inputEl.addEventListener('input', this.inputListener)
        this.inputEl.addEventListener('focus', this.inputListener)
        this.inputEl.addEventListener('blur', this.close.bind(this))
        
        this.scope.register([], 'escape', this.close.bind(this))
        
        this.viewOptions = viewOptions ?? {}
        this.suggestionParentContainer = suggestionParentContainer
        this.closingAnimationRunning = false
    }

    async onInput(): Promise<void>{
        const input = this.inputEl.value
        const suggestions = await this.getSuggestions(input)
        if(suggestions.length > 0){
            this.suggester.setSuggestions(suggestions)
            this.open()
        }
        else if(suggestions.length === 0){
            this.onNoSuggestion()
        }
    }

    onNoSuggestion(): void{
        this.close()
    }

    getContainerEl(): HTMLElement{
        return this.suggestionParentContainer
    }

    open(): void{
        if(this.closingAnimationRunning) this.abortClosingAnimation()
        if(this.suggesterView) return
        
        this.suggestionContainer = this.getContainerEl()

        this.app.keymap.pushScope(this.scope)

        this.suggesterView = new suggesterView({
            target: this.suggestionContainer,
            props:{
                textInputSuggester: this,
                options: this.viewOptions,
            },
            intro: true,
        })

        this.onOpen()
    }

    close(): void{
        this.app.keymap.popScope(this.scope)

        // Reset suggestions
        this.suggester.setSuggestions([])

        // Allow svelte to run the animation, then remove the component(s)
        if(this.suggesterView){
            this.closingAnimationRunning = true
            this.closingAnimationTimeout = setTimeout(() => {
                this.suggesterView?.$destroy()
                this.suggesterView = undefined
                this.closingAnimationRunning = false
            }, 200)
        }

        this.additionalCleaning()
        this.onClose()
    }
    abortClosingAnimation(): void{
        clearTimeout(this.closingAnimationTimeout)
        this.suggesterView?.$destroy()
        this.suggesterView = undefined
        this.closingAnimationRunning = false
    }
    
    destroy(): void{
        this.close()
        this.inputEl.removeEventListener('input', this.inputListener)
        this.inputEl.removeEventListener('focus', this.inputListener)
    }
    
    scrollSelectedItemIntoView(): void{
        get(this.suggester.suggestionsContainer).children[this.suggester.getSelectedItemIndex()]?.scrollIntoView({behavior: 'auto', block: 'nearest', inline: 'nearest'})
    }
    
    getSuggester(): Suggester<T>{
        return this.suggester
    }

    setInput(input: string): void{
        this.inputEl.value = input
        this.inputEl.dispatchEvent(new Event("input")) // Trigger input
    }

    abstract getSuggestions(input: string): T[] | Promise<T[]>
    abstract useSelectedItem(item: T, middleClick?: boolean): void
    abstract getDisplayElementProps(suggestion: T): {}
    abstract getDisplayElementComponentType(): typeof SvelteComponent
}

export abstract class PopoverTextInputSuggester<T> extends TextInputSuggester<T>{
    private popperInstance: PopperInstance
    private popperWrapper: HTMLElement
    
    constructor(app: App, inputEl: HTMLInputElement, viewOptions?: suggesterViewOptions){
        super(app, inputEl, app.dom.appContainerEl, viewOptions)
    }

    getContainerEl(): HTMLElement {
        if(document.contains(this.popperWrapper)) return this.popperWrapper
        this.popperWrapper = this.suggestionParentContainer.createDiv('popper-wrapper')
        // Render element on top of modals
        this.popperWrapper.style.zIndex = 'var(--layer-menu)' 

        // @ts-ignore
        const isPhone = Platform.isPhone
        // On phones place popover on bottom of the screen
        const popperReference = isPhone ? document.body : this.inputEl
        if(isPhone){this.popperWrapper.style.width = '100%'}
        
        this.popperInstance = createPopper(popperReference, this.popperWrapper, {
            placement: 'bottom-start',
            modifiers: [{
                name: 'offset',
                options: {
                    offset: [0, 5]
                }
            }]
        })

        return this.popperWrapper
    }

    additionalCleaning(): void {
        if(this.popperInstance){
            this.popperInstance.destroy()
        }
        if(document.body.contains(this.popperWrapper)){
            this.popperWrapper.detach()
        }
    }

    abstract getSuggestions(input: string): T[]
    abstract useSelectedItem(item: T): void
    abstract getDisplayElementProps(suggestion: T): {}
    abstract getDisplayElementComponentType(): typeof SvelteComponent
}