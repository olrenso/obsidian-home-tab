<script lang="ts">
	import { Menu, View, type TFile } from "obsidian";
	import type { RecentFileManager, recentFile } from "src/recentFiles";
	import type { HomeTabSettings } from "src/settings";
	import FileDisplayItem from "./svelteComponents/fileDisplayItem.svelte";

    export let view: View
    export let recentFileList: recentFile[]
    export let pluginSettings: HomeTabSettings
    export let recentFileManager: RecentFileManager
    const app = view.leaf.app

    let selectedFile: TFile

    let contextualMenu: Menu = new Menu()
            .addItem((item) => item
                .setTitle('Hide file')
                .setIcon('eye-off')
                .onClick(() => recentFileManager.removeRecentFile(selectedFile)))
            .setUseNativeMenu(app.vault.config.nativeMenus)
</script>

<div class="home-tab-recent-files-container">
    <div class="home-tab-recent-files-title">
        Recent files
    </div>
    <div class="home-tab-recent-files-wrapper">
        {#each recentFileList as recentFile (recentFile.file.path)}
            <FileDisplayItem file={recentFile.file} {app} {pluginSettings} {contextualMenu}
            on:itemMenu={(e) => selectedFile = e.detail.file}/>
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
        /* min-width: 250px; */
        max-width: 900px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        margin: auto;
    }

    @media(max-width: 600px){
        .home-tab-recent-files-container{
            padding-bottom: 75px;
        }
    }
</style>