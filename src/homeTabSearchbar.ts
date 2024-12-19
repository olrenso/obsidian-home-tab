import { Notice, type App, type View } from "obsidian";
import type HomeTab from "./main";
import { writable, type Writable, get } from "svelte/store";
import HomeTabFileSuggester from "src/suggester/homeTabSuggester";
import OmnisearchSuggester from "./suggester/omnisearchSuggester";
import SurfingSuggester from "./suggester/surfingSuggester";
import WebViewerSuggester from "./suggester/webViewerSuggester";
import { fileTypes, type FileExtension, type FileType, fileExtensions } from "./utils/getFileTypeUtils";
import { isValidUrl } from "./utils/urlUtils";
import { debounce } from "./utils/debounce";

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
    
    public fileSuggester: HomeTabFileSuggester | OmnisearchSuggester | SurfingSuggester | WebViewerSuggester
    public activeExtEl: Writable<HTMLElement>
    public searchBarEl: Writable<HTMLInputElement>
    public suggestionContainerEl: Writable<HTMLElement>

    constructor(plugin: HomeTab, view: View, onLoad?: Function) {
        this.app = view.app;
        this.view = view;
        this.plugin = plugin;
        this.searchBarEl = writable();
        this.activeExtEl = writable();
        this.suggestionContainerEl = writable();
        this.onLoad = onLoad;
        this.activeFilter = 'default';
    }

    public setSearchBarEl(el: HTMLInputElement): void {
        if (!el) return;
        this.searchBarEl.set(el);
        
        // 添加输入事件监听
        el.addEventListener('input', () => {
            const query = el.value.trim();
            this.handleInput(query);
        });
    }

    private handleInput(query: string): void {
        // 如果还没有建议器，创建默认的
        if (!this.fileSuggester) {
            this.createDefaultSuggester();
        }
        
        // 如果是 URL，切换到 WebViewerSuggester
        if (query && isValidUrl(query)) {
            if (!(this.fileSuggester instanceof WebViewerSuggester)) {
                // 确保先关闭旧的建议器
                this.fileSuggester.close();
                this.fileSuggester.destroy();
                this.fileSuggester = new WebViewerSuggester(this.plugin.app, this.plugin, this.view, this);
            }
            // 更新建议
            this.fileSuggester.onInput();
        }
        // 如果不是 URL 但当前是 WebViewerSuggester，切换回默认建议器
        else if (this.fileSuggester instanceof WebViewerSuggester) {
            // 确保先关闭旧的建议器
            this.fileSuggester.close();
            this.fileSuggester.destroy();
            this.createDefaultSuggester();
            // 更新建议
            this.fileSuggester.onInput();
        }
        // 如果建议器类型没变，直接调用 onInput
        else {
            this.fileSuggester.onInput();
        }
    }

    private createDefaultSuggester(): void {
        if (this.plugin.settings.omnisearch && this.plugin.app.plugins.getPlugin('omnisearch')) {
            this.fileSuggester = new OmnisearchSuggester(this.app, this.plugin, this.view, this);
        } else {
            this.fileSuggester = new HomeTabFileSuggester(this.app, this.plugin, this.view, this);
        }
    }

    public focusSearchbar(): void {
        // Set cursor on search bar
        if (this.searchBarEl)
            get(this.searchBarEl).focus();
    }

    public load(): void {
        const query = get(this.searchBarEl)?.value?.trim() || '';
        
        // 确保先销毁之前的建议器
        if (this.fileSuggester) {
            this.fileSuggester.destroy();
        }
        
        // 创建新的建议器
        this.createSuggester(query);

        this.onLoad ? this.onLoad() : null;
    }

    private createSuggester(query: string): void {
        // 如果是 URL，使用 WebViewerSuggester
        if (query && isValidUrl(query)) {
            this.fileSuggester = new WebViewerSuggester(this.plugin.app, this.plugin, this.view, this);
            this.fileSuggester.onInput();
            return;
        }

        // 否则使用其他建议器
        if (this.plugin.settings.omnisearch && this.plugin.app.plugins.getPlugin('omnisearch')) {
            this.fileSuggester = new OmnisearchSuggester(this.plugin.app, this.plugin, this.view, this);
        } else {
            this.fileSuggester = new HomeTabFileSuggester(this.plugin.app, this.plugin, this.view, this);
        }
    }

    public updateActiveSuggester(filterKey: FilterKey){
        this.fileSuggester.destroy()
        const filterEl = get(this.activeExtEl)
        const query = get(this.searchBarEl)?.value?.trim() || '';

        // 如果是 URL，始终使用 WebViewerSuggester
        if (query && isValidUrl(query)) {
            filterEl.toggleClass('hide', true);
            this.createSuggester(query);
            return;
        }

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
                this.fileSuggester.onInput();
                break;
            case 'omnisearch':
                if(this.app.plugins.getPlugin('omnisearch')){
                    filterEl.toggleClass('hide', false)
                    this.fileSuggester = new OmnisearchSuggester(this.plugin.app, this.plugin, this.view, this)
                    this.fileSuggester.onInput();
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
                    this.fileSuggester.onInput();
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
                this.fileSuggester.onInput();
                break;
            default:
                break;
        }     
    }
}
