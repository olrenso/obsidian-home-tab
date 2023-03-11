import { Plugin, WorkspaceLeaf } from 'obsidian';
import { getStarredFiles } from 'src/utils/getFilesUtils';
import { HomeTabView, VIEW_TYPE } from 'src/homeView';
import { HomeTabSettingTab, DEFAULT_SETTINGS, type HomeTabSettings } from './settings'
import { pluginSettingsStore, starredFiles } from './store'
import { RecentFileManager } from './recentFiles';

declare module 'obsidian'{
	interface App{
		internalPlugins: InternalPlugins
		dom: any
	}
	interface InternalPlugins{
		getPluginById: Function
		plugins: {
			starred: StarredPlugin
		}
	}
	interface StarredPlugin extends Plugin_2{
		instance: {
			items: StarredFile[]
			toggleFileStar: Function
		}
	}
	interface StarredFile{
		type: string,
		title: string,
		path: string
	}
	interface Workspace{
		createLeafInTabGroup: Function
	}
	interface WorkspaceLeaf{
		rebuildView: Function
		parent: WorkspaceSplit
		activeTime: number
		app: App
	}
	interface WorkspaceSplit{
		children: WorkspaceLeaf[]
	}
	interface TFile{
		deleted: boolean
	}
}

export default class HomeTab extends Plugin {
	settings: HomeTabSettings;
	recentFileManager: RecentFileManager
	
	async onload() {
		console.log('Loading home-tab plugin')
		
		await this.loadSettings();
		this.addSettingTab(new HomeTabSettingTab(this.app, this))

		this.registerView(VIEW_TYPE, (leaf) => new HomeTabView(leaf, this));		

		// Replace new tabs with home tab view
		this.registerEvent(this.app.workspace.on('layout-change', () => this.activateView()))
		// Refocus search bar on leaf change
		this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf: WorkspaceLeaf) => {if(leaf.view instanceof HomeTabView){leaf.view.focusSearchbar()}}))

		pluginSettingsStore.set(this.settings) // Store the settings for the svelte components

		if(this.settings.showRecentFiles){
			this.recentFileManager = new RecentFileManager(app, this)
			this.recentFileManager.load()
		}

		// Wait for all plugins to load before check if the starred plugin is enabled
		this.app.workspace.onLayoutReady(() => {
			if(this.app.internalPlugins.getPluginById('starred')){
				// Get and store starred files
				starredFiles.set(getStarredFiles())
				// Update stored starred files list when a file is starred or unstarred
				this.registerEvent(this.app.internalPlugins.getPluginById('starred').instance.on('changed', () => starredFiles.set(getStarredFiles())))
			}
		})
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE);
		this.recentFileManager.unload()
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		pluginSettingsStore.update(() => this.settings)
	}

	activateView() {
		const leaf = app.workspace.getMostRecentLeaf()
		if(leaf && leaf.getViewState().type === 'empty'){
			leaf.setViewState({
				type: VIEW_TYPE,
			})
		}
	}

	refreshOpenViews(){
		this.app.workspace.getLeavesOfType(VIEW_TYPE).forEach((leaf) => leaf.rebuildView())
	}
}