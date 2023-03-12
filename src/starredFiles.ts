import { Component, TAbstractFile, TFile, type App, type StarredFile } from "obsidian";
import { get, type Writable } from "svelte/store";
import type HomeTab from "./main";
import type { LucideIcon } from "./utils/lucideIcons";

export interface starredFileStore{
    filepath: string
    iconId: LucideIcon | undefined
}
export interface customStarredFile{
    file: TFile
    iconId: LucideIcon | undefined
}

export class starredFileManager extends Component{
    private app: App
    private plugin: HomeTab
    private starredFileStore: Writable<customStarredFile[]>

    constructor(app: App, plugin: HomeTab, starredFileStore: Writable<customStarredFile[]>){
        super()

        this.app = app
        this.plugin = plugin
        this.starredFileStore = starredFileStore
    }

    onload(): void{
        // Load stored starred files, then check if they've changed
        this.loadStoredStarredFiles()
        this.updateStarredFiles()
        // Update stored starred files list when a file is starred or unstarred
        this.registerEvent(this.app.internalPlugins.getPluginById('starred').instance.on('changed', () => this.updateStarredFiles()))
    }

    private updateStarredFiles(): void{
        const starredFiles = this.getStarredFiles()
        
        this.starredFileStore.update((filesArray) => {
            const updatedArray: customStarredFile[] = []

            starredFiles.forEach((starredFile) => {
                updatedArray.push({
                    file: starredFile,
                    // Retrieve icon from stored array
                    iconId: filesArray.find((item) => item.file === starredFile)?.iconId ?? undefined
                })
            })
            
            return updatedArray
        })

        this.storeStarredFiles()
    }

    public updateStarredFileIcon(file: TFile, iconId: LucideIcon): void{
        this.starredFileStore.update((filesArray) => {
            const itemIndex = filesArray.findIndex((item) => item.file === file)
            filesArray[itemIndex].iconId = iconId
            return filesArray
        })

        this.storeStarredFiles()
    }

    private getStarredFiles(): TFile[]{
        if(this.app.internalPlugins.getPluginById('starred')){
            const starredItems = app.internalPlugins.plugins.starred.instance.items
            const starredFiles: TFile[] = []
    
            starredItems.forEach((item: StarredFile) => {
                if (item.type === 'file'){
                    const file = app.vault.getAbstractFileByPath(item.path)
                    if (file instanceof TFile){
                        starredFiles.push(file)
                    }
                }
            })
            return starredFiles
        }
        return []
    }

    private async storeStarredFiles(): Promise<void>{
        if(this.app.internalPlugins.getPluginById('starred')){
            let storeObj: starredFileStore[] = []
            get(this.starredFileStore).forEach((item) => storeObj.push({
                filepath: item.file.path, // Store only the path instead of the entire TFile instance
                iconId: item.iconId
            }))
            this.plugin.settings.starredFileStore = storeObj
            await this.plugin.saveData(this.plugin.settings)
        }
    }

    private loadStoredStarredFiles(): void{
        if(this.app.internalPlugins.getPluginById('starred')){
            let filesToLoad: customStarredFile[] = []
            this.app.workspace.onLayoutReady(() => {
                this.plugin.settings.starredFileStore.forEach((item) => {
                    let file: TAbstractFile | null = this.app.vault.getAbstractFileByPath(item.filepath)
                    if(file && file instanceof TFile){
                        filesToLoad.push({
                            file: file,
                            iconId: item.iconId
                        })
                    }
                })
                this.starredFileStore.set(filesToLoad)   
            })
        }
    }
}