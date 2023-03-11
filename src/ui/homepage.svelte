<script lang="ts">
    import SearchBar from './searchBar.svelte';
    import type { HomeTabSettings } from 'src/settings';
    import { pluginSettingsStore, recentFiles, starredFiles} from '../store'
    import { getIcon, type TFile } from 'obsidian'
    import type { HomeTabView } from '../homeView';
	import type { recentFile } from 'src/recentFiles';
	import StarredFiles from './starredFiles.svelte';
	import RecentFiles from './recentFiles.svelte';
    
    export let view: HomeTabView

    let plugin = view.plugin
    
    let starredFileList: TFile[]
    let pluginSettings: HomeTabSettings
    let recentFileList: recentFile[]
    
    pluginSettingsStore.subscribe((settings) => {
        pluginSettings = settings
    
        if(pluginSettings.showStarredFiles){
            starredFiles.subscribe((files) => starredFileList = files)
        }
        if(pluginSettings.showRecentFiles){
            recentFiles.subscribe((files) => recentFileList = files)
        }
    })

    const vaultAdapter = app.vault.adapter
    const gradientUniqueId = view.leaf.activeTime
    const isStarredPluginEnabled = app.internalPlugins.getPluginById('starred') ? true : false

</script>
  
<main class="home-tab">
    <div class="home-tab-wordmark-container">
        {#if !(pluginSettings.logoType === 'none')}
            <div class="home-tab-logo" style="margin-right: calc({pluginSettings.fontSize}/5)">
                {#if pluginSettings.logoType === 'default'}
                    <!-- Obsidian logo -->
                    <svg viewBox="0 0 65 100"
                    width="calc({pluginSettings.fontSize}*{pluginSettings.logoScale})" height="calc({pluginSettings.fontSize}*{pluginSettings.logoScale})">
                        <defs>
                            <!-- If gradient id is not unique the logo is not rendered correctly -->
                            <linearGradient id="{gradientUniqueId.toString()}" x1="82.85" y1="30.41" x2="51.26" y2="105.9"
                                            gradientTransform="matrix(1, 0, 0, -1, -22.41, 110.97)"
                                            gradientUnits="userSpaceOnUse">
                                <stop offset="0" stop-color="#6c56cc"/>
                                <stop offset="1" stop-color="#9785e5"/>
                            </linearGradient>
                        </defs>
                        <polygon points="44.61 0 12.91 17.52 0 45.45 19.57 90.47 47.35 100 52.44 89.8 63 26.39 44.61 0"
                                 fill="#34208c"/>
                        <polygon points="63 26.39 43.44 14.41 16.43 35.7 47.35 100 52.44 89.8 63 26.39" fill="url(#{gradientUniqueId})"/>
                        <polygon points="63 26.39 63 26.39 44.61 0 43.44 14.41 63 26.39" fill="#af9ff4"/>
                        <polygon points="43.44 14.41 44.61 0 12.91 17.52 16.43 35.7 43.44 14.41" fill="#4a37a0"/>
                        <polygon points="16.43 35.7 19.57 90.47 47.35 100 16.43 35.7" fill="#4a37a0"/>
                    </svg>

                {:else if pluginSettings.logoType === 'lucideIcon' && !!pluginSettings.logo.lucideIcon}
                        <svg xmlns="http://www.w3.org/2000/svg"  width="calc({pluginSettings.fontSize}*{pluginSettings.logoScale})" height="calc({pluginSettings.fontSize}*{pluginSettings.logoScale})" 
                        viewBox="0 0 24 24" fill="none" stroke="{pluginSettings.iconColorType === 'default' ? 'currentColor' : pluginSettings.iconColorType === 'accentColor' ?  'var(--interactive-accent)' : pluginSettings.iconColor}" 
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
                        class="svg-icon lucide-{pluginSettings.logo.lucideIcon}">
                            {@html getIcon(pluginSettings.logo.lucideIcon)?.innerHTML}
                        </svg>
                {:else if pluginSettings.logoType === 'imagePath' && !!pluginSettings.logo.imagePath}
                        <img src="{vaultAdapter.getResourcePath(pluginSettings.logo.imagePath)}" alt="home-tab-logo"
                            style="max-width: calc({pluginSettings.fontSize}*{pluginSettings.logoScale});
                                    max-height: calc({pluginSettings.fontSize}*{pluginSettings.logoScale});">
                {:else if pluginSettings.logoType === 'imageLink' && !!pluginSettings.logo.imageLink}
                        <img src="{pluginSettings.logo.imageLink}" alt="home-tab-logo"
                            style="max-width: calc({pluginSettings.fontSize}*{pluginSettings.logoScale});
                                max-height: calc({pluginSettings.fontSize}*{pluginSettings.logoScale});">
                {/if}
            </div>
        {/if}
        <div class=home-tab-wordmark>
            <h1 style="font-family: {pluginSettings.customFont === 'interfaceFont' ? 'var(--interface-font)' : pluginSettings.customFont === 'textFont' ? 'var(--font-text)' : pluginSettings.customFont === 'monospaceFont' ? 'var(--font-monospace)' : pluginSettings.font};
                        font-size: {pluginSettings.fontSize};
                        font-weight: {pluginSettings.fontWeight.toString()};
                        color: {pluginSettings.fontColorType === 'default' ? '' : pluginSettings.fontColorType === 'accentColor' ? 'var(--interactive-accent)' : pluginSettings.fontColor };">
                {pluginSettings.wordmark}
            </h1>
        </div>
    </div>
    
    <SearchBar {view}/>

    {#if pluginSettings.showStarredFiles && starredFileList && isStarredPluginEnabled}
        <StarredFiles {starredFileList} {view} {pluginSettings}/>
    {/if}

    {#if pluginSettings.showRecentFiles && plugin.recentFileManager && recentFileList.length > 0}
        <RecentFiles {recentFileList} {view} {pluginSettings} recentFileManager={plugin.recentFileManager}/>
    {/if}
</main>
  
<style>
    .home-tab-logo svg{
        height: unset;
        width: unset;
    }
    .home-tab-wordmark-container{
        display: flex;
        align-items: center;
        justify-content: center;
        padding-top: 100px;
    }
    .home-tab-wordmark h1{
        margin: unset;
    }    
</style>