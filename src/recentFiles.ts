import { Component, type App, TFile } from "obsidian";
import { get } from "svelte/store";
import type HomeTab from "./main";
import type { HomeTabSettings } from "./settings";
import { pluginSettingsStore, recentFiles } from "./store";

export interface recentFile{
    file: TFile,
    timestamp: number,
}

export class RecentFileManager extends Component{
    private app: App
    private plugin: HomeTab
    private pluginSettings: HomeTabSettings

    constructor(app: App, plugin: HomeTab){
        super()
        this.app = app
        this.plugin = plugin
        // this.pluginSettings = this.plugin.settings
        pluginSettingsStore.subscribe(settings => this.pluginSettings = settings)

    }
    
    onload(): void {
        this.registerEvent(this.app.workspace.on('file-open', (file) => this.updateRecentFiles(file))) // Save file to recent files list on opening
        this.registerEvent(this.app.vault.on('delete', (file) => file instanceof TFile ? this.removeRecentFile(file) : null)) // Remove recent file if deleted
        this.registerEvent(this.app.vault.on('rename', (file) => file instanceof TFile ? this.onFileRename() : null)) // Update displayed name on file rename
    }

    private updateRecentFiles(openedFile: TFile | null): void{
        if(openedFile){
            recentFiles.update((filesArray) => {
                // If file is already in the recent files list update only the timestamp
                if(filesArray.some((item) => item.file === openedFile)){
                    const itemIndex = filesArray.findIndex((item) => item.file === openedFile)
                    filesArray[itemIndex].timestamp = Date.now()
                }
                // If the recent files list is full replace the last (oldest) item
                else if(filesArray.length >= this.pluginSettings.maxRecentFiles){
                    filesArray[filesArray.length - 1] = {
                        file: openedFile,
                        timestamp: Date.now()
                    }
                }
                // If there is space and the file is not already in the recent files list add it
                else{
                    filesArray.push({
                        file: openedFile,
                        timestamp: Date.now(),
                    })
                }
                // Sort files by descending (new to old) opening time
                return filesArray.sort((a,b) => b.timestamp - a.timestamp)
            })
        }
    }
    
    removeRecentFile(file: TFile): void{
        recentFiles.update((filesArray) => {
            filesArray.splice(filesArray.findIndex((recentFile) => recentFile.file == file), 1)
            return filesArray
        })
    }

    onNewMaxListLenght(newValue: number){
        const currentLenght = get(recentFiles).length
        // console.log(currentLenght, newValue, currentLenght - newValue)
        if(newValue < currentLenght){
            this.removeRecentFiles(currentLenght - newValue)
        }
    }

    private removeRecentFiles(number: number){
        recentFiles.update((filesArray) => {
            filesArray.splice(filesArray.length - number, number)
            return filesArray
        })
    }

    private onFileRename(): void{
        // Trigger refresh of svelte component, not sure if it's the best approach
        recentFiles.update((filesArray) => filesArray)
    }
}

