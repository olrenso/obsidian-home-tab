<script lang="ts">
	import { Notice, TFile } from "obsidian";
	import type { HomeTabView } from "src/homeView";
	import type { HomeTabSettings } from "src/settings";
	import FileDisplayItem from "./fileDisplayItem.svelte";

    export let starredFileList: TFile[]
    export let view: HomeTabView
    export let pluginSettings: HomeTabSettings

    const app = view.leaf.app
    const removeBtnAriaLabel = "Unstar file"

    const onItemRemove = (file: TFile) => {
        if(app.internalPlugins.getPluginById('starred')){
        app.internalPlugins.plugins.starred.instance.toggleFileStar(file)
        }
        else{
            new Notice("Starred plugin is not enabled")
        }
    }
</script>

<div class="home-tab-starred-files-container">
    {#each starredFileList as file (file.path)}
        <FileDisplayItem {file} {app} {pluginSettings} {onItemRemove} {removeBtnAriaLabel}/>
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