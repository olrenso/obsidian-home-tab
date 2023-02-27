import { FileView, WorkspaceLeaf } from "obsidian";
import type HomeTab from "./main";
import Homepage from './ui/homepage.svelte'
import { writable, type Writable, get} from "svelte/store";
import HomeTabFileSuggester from "src/suggester/homeTabSuggester";

export const VIEW_TYPE = "home-tab-view";

export class HomeTabView extends FileView {
    plugin: HomeTab
    homepage: Homepage
    activeExtEl: Writable<HTMLElement>
    searchBarEl: Writable<HTMLInputElement>
    suggestionContainerEl: Writable<HTMLElement>
    fileSuggester: HomeTabFileSuggester

    constructor(leaf: WorkspaceLeaf, plugin: HomeTab) {
        super(leaf);
        this.leaf = leaf
        this.plugin = plugin
        this.searchBarEl = writable()
        this.activeExtEl = writable()
        this.suggestionContainerEl = writable()
        this.navigation = true
        this.allowNoFile = true
        this.icon = 'search'
    }

    getViewType() {
        return VIEW_TYPE;
    }
    
    getDisplayText(): string {
        return 'Home tab'
    }

    focusSearchbar(): void{
        if(this.searchBarEl) get(this.searchBarEl).focus() // Set cursor on search bar
    }

    async onOpen() {
        this.homepage = new Homepage({
            target: this.contentEl,
            props:{
                view: this,
            }
        });

        this.focusSearchbar()

        this.fileSuggester = new HomeTabFileSuggester(this.app, this.plugin, this,
            get(this.searchBarEl), get(this.suggestionContainerEl))
    }

    async onClose() {
        this.homepage.$destroy();
    }
} 
