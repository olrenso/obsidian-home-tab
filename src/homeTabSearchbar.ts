import { Notice, type App, type View } from "obsidian";
import type HomeTab from "./main";
import { writable, type Writable, get } from "svelte/store";
import HomeTabFileSuggester from "src/suggester/homeTabSuggester";
import OmnisearchSuggester from "./suggester/omnisearchSuggester";
import SurfingSuggester from "./suggester/surfingSuggester";
import { fileTypes, type FileExtension, type FileType, fileExtensions } from "./utils/getFileTypeUtils";

export type SearchBarFilterType = 'fileExtension' | 'fileType' | 'webSearch' | 'omnisearch' | 'default'

const omnisearchKeys = ['omnisearch', 'omni'] as const
const webSearchKeys = ['surfing', 'web', 'internet'] as const

export type OmnisearchFilterKey = typeof omnisearchKeys[number]
export type WebsearchFilterKey = typeof webSearchKeys[number]
export type ExtensionsearchFilterKey = FileExtension
export type FileTypesearchFilterKey = FileType

type FilterKeyLookupTable = {[key in SearchBarFilterType]: string[]}
const filterKeysLookupTable: FilterKeyLookupTable = {
    default: [],
    omnisearch: [...omnisearchKeys],
    webSearch: [...webSearchKeys],
    fileType: [...fileTypes],
    fileExtension: [...fileExtensions],
}

export const filterKeys = [...filterKeysLookupTable.omnisearch, ...filterKeysLookupTable.webSearch, 
                    ...filterKeysLookupTable.fileType, ...filterKeysLookupTable.fileExtension]

export type FilterKey = typeof filterKeys[number]

export default class HomeTabSearchBar{
    private app: App
    private onLoad: Function | undefined
    public activeFilter: SearchBarFilterType
    
    protected view: View
    protected plugin: HomeTab
    
    public fileSuggester: HomeTabFileSuggester | OmnisearchSuggester | SurfingSuggester
    public activeExtEl: Writable<HTMLElement>
    public searchBarEl: Writable<HTMLInputElement>
    public suggestionContainerEl: Writable<HTMLElement>

    constructor(plugin: HomeTab, view: View, onLoad?: Function) {
        this.app = view.app
        this.view = view;
        this.plugin = plugin;
        this.searchBarEl = writable();
        this.activeExtEl = writable();
        this.suggestionContainerEl = writable();
        this.onLoad = onLoad;
    }

    public focusSearchbar(): void {
        // Set cursor on search bar
        if (this.searchBarEl)
            get(this.searchBarEl).focus();
    }

    public load(): void {
        if (this.plugin.settings.omnisearch && this.plugin.app.plugins.getPlugin('omnisearch')) {
            this.fileSuggester = new OmnisearchSuggester(this.plugin.app, this.plugin, this.view, this);
        }
        else {
            this.fileSuggester = new HomeTabFileSuggester(this.plugin.app, this.plugin, this.view, this);
        }

        this.onLoad ? this.onLoad() : null;
    }

    public updateActiveSuggester(filterKey: FilterKey){
        this.fileSuggester.destroy()
        const filterEl = get(this.activeExtEl)

        let filter: SearchBarFilterType = 'default'

        // Match key from search bar input to filter type
        for(const filterType of Object.keys(filterKeysLookupTable) as Array<SearchBarFilterType>){
            if(filterKeysLookupTable[filterType].includes(filterKey)){
                filter = filterType
            }
        }

        filterEl.setText(filter)
        // const oldFilter = this.activeFilter
        this.activeFilter = filter

        switch(filter){
            case 'default':
                filterEl.toggleClass('hide', true)
                if (this.plugin.settings.omnisearch && this.plugin.app.plugins.getPlugin('omnisearch')) {
                    this.fileSuggester = new OmnisearchSuggester(this.plugin.app, this.plugin, this.view, this);
                }
                else {
                    this.fileSuggester = new HomeTabFileSuggester(this.plugin.app, this.plugin, this.view, this);
                }
                this.fileSuggester.setInput('')
                break;
            case 'omnisearch':
                if(this.app.plugins.getPlugin('omnisearch')){
                    filterEl.toggleClass('hide', false)
                    this.fileSuggester = new OmnisearchSuggester(this.plugin.app, this.plugin, this.view, this)
                    this.fileSuggester.setInput('')
                }
                else{
                    new Notice('Omnisearch plugins is not enabled.')
                    this.updateActiveSuggester('default')
                }
                break;
            case 'webSearch':
                if(this.app.plugins.getPlugin('surfing')){
                    filterEl.toggleClass('hide', false)
                    this.fileSuggester = new SurfingSuggester(this.plugin.app, this.plugin, this.view, this)
                    this.fileSuggester.setInput('')
                }
                else{
                    new Notice('Surfing plugin is not enabled.')
                    this.updateActiveSuggester('default')
                }
                break;
            case 'fileExtension':
            case 'fileType':
                this.fileSuggester = new HomeTabFileSuggester(this.plugin.app, this.plugin, this.view, this)
                this.fileSuggester.setFileFilter(filterKey as FileType | FileExtension)
                filterEl.toggleClass('hide', false)
                filterEl.setText(filterKey)
                this.fileSuggester.setInput('')
                break;
            default:
                break;
        }     
    }
}
