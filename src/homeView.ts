import { FileView, MarkdownRenderChild, View, WorkspaceLeaf } from "obsidian";
import type HomeTab from "./main";
import Homepage from './ui/homepage.svelte'
import { writable, type Writable, get} from "svelte/store";
import HomeTabFileSuggester from "src/suggester/homeTabSuggester";
import OmnisearchSuggester from "./suggester/omnisearchSuggester";

export const VIEW_TYPE = "home-tab-view";

export class HomeTabSearchBar{
    protected view: View
    protected plugin: HomeTab
    public fileSuggester: HomeTabFileSuggester | OmnisearchSuggester
    public activeExtEl: Writable<HTMLElement>
    public searchBarEl: Writable<HTMLInputElement>
    public suggestionContainerEl: Writable<HTMLElement>
    private onLoad: Function | undefined

    constructor(plugin: HomeTab, view: View, onLoad?: Function){
        this.view = view
        this.plugin = plugin
        this.searchBarEl = writable()
        this.activeExtEl = writable()
        this.suggestionContainerEl = writable()
        this.onLoad = onLoad
    }

    public focusSearchbar(): void{
        // Set cursor on search bar
        if(this.searchBarEl) get(this.searchBarEl).focus()
    }

    public load(): void{
        if(this.plugin.settings.omnisearch && this.plugin.app.plugins.getPlugin('omnisearch')){
            this.fileSuggester = new OmnisearchSuggester(this.plugin.app, this.plugin, this.view, this)
        }
        else{
            this.fileSuggester = new HomeTabFileSuggester(this.plugin.app, this.plugin, this.view, this)
        }
        this.onLoad ? this.onLoad() : null
    }
}

export class EmbeddedHomeTab extends MarkdownRenderChild{
    searchBar: HomeTabSearchBar
    homepage: Homepage
    plugin: HomeTab
    view: View
    recentFiles: boolean | undefined
    starredFiles: boolean | undefined
    searchbarOnly: boolean | undefined

    constructor(containerEl: HTMLElement, view: View, plugin: HomeTab, codeBlockContent: string){
        super(containerEl)
        this.view = view
        this.plugin = plugin

        this.parseCodeBlockContent(codeBlockContent)
        this.searchBar = new HomeTabSearchBar(plugin, view)
    }

    onload(): void{
        this.homepage = new Homepage({
            target: this.containerEl,
            props: {
                plugin: this.plugin,
                view: this.view,
                HomeTabSearchBar: this.searchBar,
                embeddedView: this
            }
        })

        this.searchBar.load()
    }

    onunload(): void {
        this.plugin.activeEmbeddedHomeTabViews.splice(this.plugin.activeEmbeddedHomeTabViews.findIndex(item => item.view == this.view),1)
        this.searchBar.fileSuggester.close()
        this.homepage.$destroy()
    }

    private parseCodeBlockContent(codeBlockContent: string){
        codeBlockContent.split('\n')
        .map((line: string) => line.trim())
        .forEach((line: string) => {
            switch (true) {
                case line === '':
                    break
                case line === 'only search bar':
                    this.searchbarOnly = true
                    break
                case line === 'show recent files':
                    this.recentFiles = true
                    break
                case line === 'show starred files':
                    this.starredFiles = true
                    break
            }
        });
    }
}

export class HomeTabView extends FileView{
    plugin: HomeTab
    homepage: Homepage
    searchBar: HomeTabSearchBar
    containerEl: HTMLElement

    constructor(leaf: WorkspaceLeaf, plugin: HomeTab) {
        super(leaf);
        this.leaf = leaf
        this.plugin = plugin
        this.navigation = true
        this.allowNoFile = true
        this.icon = 'search'

        this.searchBar = new HomeTabSearchBar(this.plugin, this)
    }

    getViewType() {
        return VIEW_TYPE;
    }
    
    getDisplayText(): string {
        return 'Home tab'
    }

    async onOpen(): Promise<void> {
        this.homepage = new Homepage({
            target: this.contentEl,
            props:{
                plugin: this.plugin,
                view: this,
                HomeTabSearchBar: this.searchBar
            }
        });
        this.searchBar.load()
        this.searchBar.focusSearchbar()

        // this.fileSuggester = new HomeTabFileSuggester(this.app, this.plugin, this,
            // get(this.searchBarEl), get(this.suggestionContainerEl))
    }

    async onClose(): Promise<void>{
        this.searchBar.fileSuggester.close()
        this.homepage.$destroy();
    }
} 
