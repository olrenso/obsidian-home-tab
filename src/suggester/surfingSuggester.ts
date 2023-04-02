import type Fuse from 'fuse.js'
import { Platform, Plugin_2, View, WorkspaceLeaf, type App } from 'obsidian'
import type HomeTab from '../main'
import type HomeTabSearchBar from "src/homeTabSearchbar"
import { TextInputSuggester } from './suggester'
import { generateHotkeySuggestion } from 'src/utils/htmlUtils'
import { get } from 'svelte/store'
import SurfingSuggestion from 'src/ui/svelteComponents/surfingSuggestion.svelte'
import { SurfingItemFuzzySearch } from './fuzzySearch'

interface SurfingPlugin extends Plugin_2{
    settings: SurfingSettings
}
interface SurfingSettings{
	defaultSearchEngine: string;
}
interface SurfingView extends View{
    navigate: (url: string, addToHistory?: boolean, updateWebView?: boolean) => void
}
interface WebBrowserViewState{
	url: string
	active?: boolean
}
interface SurfingJSONstoreObj{
    bookmarks: SurfingBookmark[]
    categories: SurfingCategory[]
}

interface SurfingCategory{
    value: string
    text: string
    label: string
    children: []
}

interface SurfingBookmark{
    id: number
    name: string
    url: string
    description: string
    category: string[]
    tags: string
    create: number
    modified: number
}

export interface SurfingItem{
    type: 'bookmark' | 'history' | 'open' | 'newUrl'
    name: string
    url: string
    description?: string
}

export default class SurfingSuggester extends TextInputSuggester<Fuse.FuseResult<SurfingItem>>{
    // private files: SearchFile[]
    private surfingPlugin: SurfingPlugin
    private surfingJSONfile: string = 'surfing-bookmark.json'

    private fuzzySearch: SurfingItemFuzzySearch

    private view: View
    private plugin: HomeTab
    private searchBar: HomeTabSearchBar

    constructor(app: App, plugin: HomeTab, view: View, searchBar: HomeTabSearchBar) {
        super(app, get(searchBar.searchBarEl), get(searchBar.suggestionContainerEl), {
                // @ts-ignore
                containerClass: `home-tab-suggestion-container ${Platform.isPhone ? 'is-phone' : ''}`,
                additionalClasses: `${plugin.settings.selectionHighlight === 'accentColor' ? 'use-accent-color' : ''}`,
                additionalModalInfo: plugin.settings.showShortcuts ? generateHotkeySuggestion([
                    {hotkey: '↑↓', action: 'to navigate'},
                    {hotkey: '↵', action: 'to open'},
                    {hotkey: 'ctrl ↵', action: 'to open in new tab'},
                    {hotkey: 'esc', action: 'to dismiss'},], 
                    'home-tab-hotkey-suggestions') : undefined
                }, plugin.settings.searchDelay)

        this.plugin = plugin
        this.view = view
        this.searchBar = searchBar
        
        this.surfingPlugin = this.app.plugins.getPlugin('surfing') as SurfingPlugin

        this.fuzzySearch = new SurfingItemFuzzySearch(this.getSurfingItems())

        // Open url in new tab
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

    onNoSuggestion(): void {
        const input = this.inputEl.value
        if (!!input){
            this.suggester.setSuggestions([{
                item: {
                    type: 'newUrl',
                    name: input,
                    url: input,
                },
                refIndex: 0,
                score: 0,
            }])
            this.open()
        }
        else{
            this.close()
        }
    }
    
    async getSuggestions(input: string): Promise<Fuse.FuseResult<SurfingItem>[]> {
        return this.fuzzySearch.rawSearch(input, this.plugin.settings.maxResults)
    }

    async useSelectedItem(selectedItem: Fuse.FuseResult<SurfingItem>, newTab?: boolean): Promise<void> {
        const leaf = this.app.workspace.getMostRecentLeaf()
        if(leaf){
            await this.patchLeaf(leaf, selectedItem.item.url)
        }
    }

    private async patchLeaf(leaf: WorkspaceLeaf, url: string): Promise<SurfingView>{
        const state: WebBrowserViewState = {
            url: url,
            active: true,
        }

        await leaf.setViewState({
            type: 'surfing-view',
            state: state
        })

        return leaf.view as SurfingView
    }

    
    getDisplayElementProps(suggestion: Fuse.FuseResult<SurfingItem>): {info: string}{
        let info: string = ''

        if(suggestion.item.type === 'newUrl'){
            info = `Search with ${this.surfingPlugin.settings.defaultSearchEngine}`
        }

        return {info: info}
    }

    getDisplayElementComponentType(): typeof SurfingSuggestion{
        return SurfingSuggestion
    }

    private getSurfingItems(): SurfingItem[]{
        const items: SurfingItem[] = []

        return items
    }

    // TODO
    private getHistory(): SurfingItem[]{
        return []
    }
    private getOpenitems(): SurfingItem[]{
        return []
    }
    private async getBookmarks(): Promise<SurfingJSONstoreObj>{
        return JSON.parse(await this.app.vault.adapter.read(`${this.app.vault.configDir}/${this.surfingJSONfile}`))
    }
    private async getBookmarkedItems(): Promise<SurfingItem[]>{
        const items: SurfingItem[] = []
        ;(await this.getBookmarks()).bookmarks.forEach(bookmark => items.push({
            type: 'bookmark',
            name: bookmark.name,
            url: bookmark.url,
            description: bookmark.description
        }))

        return items
    }
}
