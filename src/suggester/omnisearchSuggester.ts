import { Platform, TFile, View, type App } from 'obsidian'
import type HomeTab from '../main'
import type HomeTabSearchBar from "src/homeTabSearchbar"
import { TextInputSuggester } from './suggester'
import { generateHotkeySuggestion } from 'src/utils/htmlUtils'
import { get } from 'svelte/store'
import OmnisearchSuggestion from 'src/ui/svelteComponents/omnisearchSuggestion.svelte'
import { concatenateStringsToRegex, escapeStringForRegExp } from 'src/utils/regexUtils'

export type OmnisearchApi = {
    // Returns a promise that will contain the same results as the Vault modal
    search: (query: string) => Promise<ResultNoteApi[]>,
    // Refreshes the index
    refreshIndex: () => Promise<void>
    // Register a callback that will be called when the indexing is done
    registerOnIndexed: (callback: () => void) => void,
    // Unregister a callback that was previously registered
    unregisterOnIndexed: (callback: () => void) => void,
  }
export type ResultNoteApi = {
    score: number
    path: string
    excerpt: string
    basename: string
    foundWords: string[]
    matches: SearchMatchApi[]
}
export type SearchMatchApi = {
    match: string
    offset: number
}

export default class OmnisearchSuggester extends TextInputSuggester<ResultNoteApi>{
    // private files: SearchFile[]
    private omnisearch: OmnisearchApi

    private view: View
    private plugin: HomeTab
    private searchBar: HomeTabSearchBar

    constructor(app: App, plugin: HomeTab, view: View, searchBar: HomeTabSearchBar) {
        super(app, get(searchBar.searchBarEl), get(searchBar.suggestionContainerEl), {
                // @ts-ignore
                containerClass: `home-tab-suggestion-container ${Platform.isPhone ? 'is-phone' : ''}`,
                // suggestionItemClass: 'suggestion-item omnisearch-result',
                additionalClasses: `${plugin.settings.selectionHighlight === 'accentColor' ? 'use-accent-color' : ''}`,
                additionalModalInfo: plugin.settings.showShortcuts ? generateHotkeySuggestion([
                    {hotkey: '↑↓', action: 'to navigate'},
                    {hotkey: '↵', action: 'to open'},
                    // {hotkey: 'shift ↵', action: 'to create'},
                    {hotkey: 'ctrl ↵', action: 'to open in new tab'},
                    {hotkey: 'esc', action: 'to dismiss'},], 
                    'home-tab-hotkey-suggestions') : undefined
                }, plugin.settings.searchDelay)
        this.plugin = plugin
        this.view = view
        this.searchBar = searchBar
        
        // @ts-ignore
        this.omnisearch = omnisearch

        // Open file in new tab
        this.scope.register(['Mod'], 'Enter', (e) => {
            e.preventDefault()
            this.useSelectedItem(this.suggester.getSelectedItem(), true)
        })
    }

    updateSearchBarContainerEl(isActive: boolean){
        this.inputEl.parentElement?.toggleClass('is-active', isActive)
    }

    onOpen(): void {
        this.updateSearchBarContainerEl(this.suggester.getSuggestions().length > 0 ? true : false)    
    }

    onClose(): void {
        this.updateSearchBarContainerEl(false)
    }

    // onNoSuggestion(): void {
    //     const input = this.inputEl.value
    //     if (!!input) {}
    //     else{
    //         this.close()
    //     }
    // }
    
    async getSuggestions(input: string): Promise<ResultNoteApi[]> {
        const suggestions = (await this.omnisearch.search(input)).splice(0, this.plugin.settings.maxResults)
        return suggestions
    }

    useSelectedItem(selectedItem: ResultNoteApi, newTab?: boolean): void {
        const file = this.app.vault.getAbstractFileByPath(selectedItem.path)
        if(file && file instanceof TFile){
            this.openFile(file, newTab)
        }
    }

    
    getDisplayElementProps(suggestion: ResultNoteApi): {basename: string, excerpt: string}{
        const escapedWords = suggestion.foundWords.map(word => escapeStringForRegExp(word))
        const regex = concatenateStringsToRegex(escapedWords, 'gi')
        
        let content = this.plugin.settings.showOmnisearchExcerpt ? this.highlightMatches(suggestion.excerpt, regex) : ''
        let basename = this.highlightMatches(suggestion.basename, regex)
        
        return {basename: basename, excerpt: content}
    }

    getDisplayElementComponentType(): typeof OmnisearchSuggestion{
        return OmnisearchSuggestion
    }

    openFile(file: TFile, newTab?: boolean): void{
        if(newTab){
            this.app.workspace.createLeafInTabGroup().openFile(file)
        }
        else{
            this.view.leaf.openFile(file);
        }
    }

    private highlightMatches(content: string, regexMatches: RegExp): string{
        return content.replaceAll(regexMatches, (value) => `<span class="suggestion-highlight omnisearch-highlight omnisearch-default-highlight">${value}</span>`)
    }
}
