<script lang="ts">
	import { App, Menu, Notice, TFile, View } from "obsidian";
	import type { HomeTabSettings } from "src/settings";
	import { IconSelectionModal } from "src/iconSelectionModal";
	import FileDisplayItem from "./svelteComponents/fileDisplayItem.svelte";
	import type { customStarredFile, starredFileManager } from "src/starredFiles";

    export let view: View
    export let starredFileList: customStarredFile[]
    export let pluginSettings: HomeTabSettings
    export let starredFileManager: starredFileManager

    const app: App = view.leaf.app

    let selectedFile: TFile

    const selectIconModal: IconSelectionModal = new IconSelectionModal(app, undefined, (icon) => starredFileManager.updateStarredFileIcon(selectedFile, icon))

    const contextualMenu: Menu = new Menu()
            .addItem((item) => item
                .setTitle('Unstar file')
                .setIcon('star-off')
                .onClick((e) => removeStar(selectedFile)))
            .addSeparator()
            .addItem((item) => item
                .setTitle('Set custom icon')
                .setIcon('plus')
                .onClick(() => selectIconModal.open()))
            .setUseNativeMenu(app.vault.config.nativeMenus)
            
    const removeStar = (file: TFile) => {
        if(app.internalPlugins.getPluginById('starred')){
            app.internalPlugins.plugins.starred.instance.toggleFileStar(file)
        }
        else{
            new Notice("Starred plugin is not enabled")
        }
    }
   
</script>

<div class="home-tab-starred-files-container">
    {#each starredFileList as item (item.file.path)}
        <FileDisplayItem file={item.file} customIcon={item.iconId} {app} {pluginSettings} {contextualMenu}
        on:itemMenu={(e) => selectedFile = e.detail.file}/>
    {/each}
</div>

<style>
    .home-tab-starred-files-container{
        display: flex;
        align-items: baseline;
        justify-content: center;
        flex-wrap: wrap;
        
        width: 65%;
        min-width: 250px;
        max-width: 900px;
        
        padding-top: 30px;
        margin: auto;
    }
</style>