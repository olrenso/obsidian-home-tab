import { Platform, WorkspaceLeaf, type App, type View } from 'obsidian';
import type HomeTab from '../main';
import type HomeTabSearchBar from "../homeTabSearchbar";
import { TextInputSuggester } from './suggester';
import { generateHotkeySuggestion } from '../utils/htmlUtils';
import { get } from 'svelte/store';
import { isValidUrl, ensureHttps } from '../utils/urlUtils';
import WebViewerSuggestion from '../ui/svelteComponents/webViewerSuggestion.svelte';

interface WebViewerItem {
    url: string;
}

export default class WebViewerSuggester extends TextInputSuggester<WebViewerItem> {
    private plugin: HomeTab;
    private searchBar: HomeTabSearchBar;

    constructor(app: App, plugin: HomeTab, view: View, searchBar: HomeTabSearchBar) {
        super(app, get(searchBar.searchBarEl), get(searchBar.suggestionContainerEl), {
            containerClass: `home-tab-suggestion-container ${Platform.isPhone ? 'is-phone' : ''}`,
            additionalClasses: `${plugin.settings.selectionHighlight === 'accentColor' ? 'use-accent-color' : ''}`,
            additionalModalInfo: plugin.settings.showShortcuts ? generateHotkeySuggestion([
                {hotkey: '↵', action: 'to open'},
                {hotkey: 'ctrl ↵', action: 'to open in new tab'},
                {hotkey: 'esc', action: 'to dismiss'},
            ], 'home-tab-hotkey-suggestions') : undefined
        }, plugin.settings.searchDelay);

        this.plugin = plugin;
        this.searchBar = searchBar;

        // 修改快捷键处理
        this.scope.register(['Mod'], 'Enter', (e) => {
            e.preventDefault();
            // Ctrl+Enter 在新标签页打开
            this.useSelectedItem(this.suggester.getSelectedItem(), true);
        });

        // 添加普通 Enter 的处理
        this.scope.register([], 'Enter', (e) => {
            e.preventDefault();
            // 普通 Enter 在当前标签页打开
            this.useSelectedItem(this.suggester.getSelectedItem(), false);
            return false;
        });
    }

    async getSuggestions(input: string): Promise<WebViewerItem[]> {
        const trimmedInput = input.trim();
        if (!trimmedInput) {
            return [];
        }

        // 如果输入包含 http:// 或 https://，直接返回
        if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
            return [{
                url: trimmedInput
            }];
        }

        // 如果输入包含常见的域名格式，添加 https:// 前缀
        if (isValidUrl(trimmedInput)) {
            return [{
                url: `https://${trimmedInput}`
            }];
        }

        return [];
    }

    async useSelectedItem(item: WebViewerItem, newTab = false): Promise<void> {
        if (!item) return;
        
        const leaf = newTab 
            ? this.app.workspace.getLeaf('tab') 
            : this.app.workspace.getLeaf();

        await leaf.setViewState({
            type: "webviewer",
            active: true,
            state: {
                url: ensureHttps(item.url)
            }
        });
    }

    getDisplayElementComponentType() {
        return WebViewerSuggestion;
    }

    getDisplayElementProps(suggestion: WebViewerItem) {
        return {
            url: suggestion.url
        };
    }

    onOpen(): void {
        const suggestions = this.suggester.getSuggestions();
        if (suggestions && suggestions.length > 0) {
            this.suggester.setSelectedItemIndex(0);
        }
    }
}
