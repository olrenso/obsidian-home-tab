<script lang="ts">
	import type { TFile } from "obsidian";
	import type { HomeTabView } from "src/homeView";
	import type { RecentFileManager, recentFile } from "src/recentFiles";
	import type { HomeTabSettings } from "src/settings";
	import FileDisplayItem from "./fileDisplayItem.svelte";

    export let recentFileList: recentFile[]
    export let view: HomeTabView
    export let pluginSettings: HomeTabSettings
    export let recentFileManager: RecentFileManager
    const app = view.leaf.app
    const removeBtnAriaLabel = "Hide file"

    const onItemRemove = (file: TFile) => {
        recentFileManager.removeRecentFile(file)
    }
</script>

<div class="home-tab-recent-files-container">
    <div class="home-tab-recent-files-title">
        Recent files
    </div>
    <div class="home-tab-recent-files-wrapper">
        {#each recentFileList as recentFile (recentFile.file.path)}
            <FileDisplayItem file={recentFile.file} {app} {pluginSettings} {onItemRemove} {removeBtnAriaLabel}/>
        {/each}
    </div>
</div>

<style>
    .home-tab-recent-files-container{
        width: 65%;
        display: flex;
        flex-direction: column;

        padding-top: 20px;
        margin: auto;
    }
    .home-tab-recent-files-title{
        text-align: center;
        font-weight: 600;
        font-size: var(--font-ui-large);
        padding-bottom: 5px;
    }
    .home-tab-recent-files-wrapper{
        display: flex;
        min-width: 250px;
        max-width: 900px;
        align-items: baseline;
        justify-content: center;
        flex-wrap: wrap;
        margin: auto;
    }
</style>