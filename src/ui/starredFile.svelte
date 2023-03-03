<script lang="ts">
    import { File, FilePieChart, FileText, FileAudio, FileImage, FileVideo, X as DeleteIcon} from 'lucide-svelte'
    import { type WorkspaceLeaf, type TFile, type WorkspaceSplit, Notice } from 'obsidian';
    import { getFileTypeFromExtension } from 'src/utils/getFileTypeUtils';
    import { pluginSettingsStore } from 'src/store';
	import type { HomeTabSettings } from 'src/settings';

    export let leaf: WorkspaceLeaf
    export let file: TFile

    let pluginSettings: HomeTabSettings
    pluginSettingsStore.subscribe((settings) => pluginSettings = settings)
    
    // Trim filename if too long
    const filename = file.basename.length > 40 ? file.basename.slice(0,37) + '...' : file.basename
    const fileType = getFileTypeFromExtension(file.extension)

    function handleFileOpening(file: TFile, newTab?: boolean){
        if(newTab){
            const leafParent: WorkspaceSplit = leaf.parent
            const leafCount = leafParent.children.length

            app.workspace.createLeafInParent(leafParent, leafCount + 1).openFile(file)
        }
        else{
            leaf.openFile(file)
        }
    }

    function handleMouseClick(e: MouseEvent, file: TFile): void{
        if(e.button === 1){
            handleFileOpening(file, true)
        }
        else if ((e.target as HTMLElement).classList.contains('home-tab-starred-file-remove-button')){
            if(this.app.internalPlugins.getPluginById('starred')){
                this.app.internalPlugins.plugins.starred.instance.toggleFileStar(file)
            }
            else{
                new Notice("Starred plugin is disabled")
            }
        }
        else{
            handleFileOpening(file, e.ctrlKey)
        }
    }
</script>

<div class="home-tab-starred-file-wrapper" class:use-accent-color="{pluginSettings.selectionHighlight === 'accentColor'}"
     on:mousedown|preventDefault="{e => handleMouseClick(e, file)}">
    
    <div class="home-tab-starred-file-remove-button" aria-label="Unstar file"
        on:click>
        <DeleteIcon strokeWidth={1} width={24} height={24} class='svg-icon lucide-x'/>
    </div>

    <div class="home-tab-starred-file-icon">
        {#if fileType === 'markdown'}
            <FileText strokeWidth={1}/>
        {:else if fileType === 'image'}
            <FileImage strokeWidth={1}/>
        {:else if fileType === 'video'}
            <FileVideo strokeWidth={1}/>
        {:else if fileType === 'audio'}
            <FileAudio strokeWidth={1}/>
        {:else if fileType === 'pdf'}
            <FilePieChart strokeWidth={1}/>
        {:else}
            <File strokeWidth={1}/>
        {/if}
    </div>
    <div class="home-tab-starred-file-name">
        <span>{filename}</span>
    </div>
</div>

<style>
    .home-tab-starred-file-wrapper{
        margin: 5px;
        padding: 5px;
        border-radius: var(--radius-m);
        max-width: 125px;
        max-height: 100px;
        min-width: 75px;

        position: relative;
    }

    .home-tab-starred-file-wrapper:hover{
        background-color: var(--background-modifier-hover);
    }
    .home-tab-starred-file-wrapper.use-accent-color:hover{
        color: white;
        background: var(--interactive-accent);
    }

    .home-tab-starred-file-icon{
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--size-2-3);
    }

    .home-tab-starred-file-name{
        padding: var(--size-2-3);
        text-align: center;
        font-size: var(--font-ui-small);
    }

    .home-tab-starred-file-remove-button{
        opacity: 0;
        position: absolute;
        top: 4px;
        right: 4px;
    }

    .home-tab-starred-file-remove-button:hover{
        opacity: 1;
    }
</style>