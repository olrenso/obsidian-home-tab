import type Fuse from 'fuse.js'
import { normalizePath, Platform, TAbstractFile, TFile, View, type App } from 'obsidian'
import { DEFAULT_FUSE_OPTIONS, FileFuzzySearch, type SearchFile } from './fuzzySearch'
import type HomeTab from '../main'
import type HomeTabSearchBar from "src/homeTabSearchbar"
import { generateSearchFile,  getParentFolderFromPath,  getSearchFiles, getUnresolvedMarkdownFiles } from 'src/utils/getFilesUtils'
import { TextInputSuggester } from './suggester'
import { generateHotkeySuggestion } from 'src/utils/htmlUtils'
import { isValidExtension, type FileExtension, type FileType } from 'src/utils/getFileTypeUtils'
import { get } from 'svelte/store'
import HomeTabFileSuggestion from 'src/ui/svelteComponents/homeTabFileSuggestion.svelte'

declare module 'obsidian'{
    interface MetadataCache{
        onCleanCache: Function
    }
}

export default class HomeTabFileSuggester extends TextInputSuggester<Fuse.FuseResult<SearchFile>>{
    private files: SearchFile[]
    private fuzzySearch: FileFuzzySearch

    private view: View
    private plugin: HomeTab
    private searchBar: HomeTabSearchBar

    private activeFilter: FileType | FileExtension  | null

    constructor(app: App, plugin: HomeTab, view: View, searchBar: HomeTabSearchBar) {
        super(app, get(searchBar.searchBarEl), get(searchBar.suggestionContainerEl), {
                // @ts-ignore
                containerClass: `home-tab-suggestion-container ${Platform.isPhone ? 'is-phone' : ''}`,
                additionalClasses: `${plugin.settings.selectionHighlight === 'accentColor' ? 'use-accent-color' : ''}`,
                additionalModalInfo: plugin.settings.showShortcuts ? generateHotkeySuggestion([
                    {hotkey: '↑↓', action: 'to navigate'},
                    {hotkey: '↵', action: 'to open'},
                    {hotkey: 'shift ↵', action: 'to create'},
                    {hotkey: 'ctrl ↵', action: 'to open in new tab'},
                    {hotkey: 'esc', action: 'to dismiss'},], 
                    'home-tab-hotkey-suggestions') : undefined
                }, plugin.settings.searchDelay)
        this.plugin = plugin
        this.view = view
        this.searchBar = searchBar

        this.app.metadataCache.onCleanCache(() => {
            this.plugin.settings.markdownOnly ? this.files = this.filterSearchFileArray('markdown', getSearchFiles(this.plugin.settings.unresolvedLinks)) : this.files = getSearchFiles(this.plugin.settings.unresolvedLinks)
            this.fuzzySearch = new FileFuzzySearch(this.files, { ...DEFAULT_FUSE_OPTIONS, ignoreLocation: true, fieldNormWeight: 1.65, keys: [{name: 'basename', weight: 1.5}, {name: 'aliases', weight: 0.1}] })
        })

        // Open file in new tab
        this.scope.register(['Mod'], 'Enter', (e) => {
            e.preventDefault()
            this.useSelectedItem(this.suggester.getSelectedItem(), true)
        })
        // Create file
        this.scope.register(['Shift'], 'Enter', async(e) => {
            e.preventDefault()
            await this.handleFileCreation()
        })
        // Create file and open in new tab
        this.scope.register(['Shift', 'Mod'], 'Enter', async(e) => {
            e.preventDefault()
            await this.handleFileCreation(undefined, true)
        })

        this.view.registerEvent(this.app.vault.on('create', (file: TAbstractFile) => { if(file instanceof TFile){this.updateSearchfilesList(file)}}))
        this.view.registerEvent(this.app.vault.on('delete', (file: TAbstractFile) => { if(file instanceof TFile){this.updateSearchfilesList(file)}}))
        this.view.registerEvent(this.app.vault.on('rename', (file: TAbstractFile, oldPath: string) => { if(file instanceof TFile){this.updateSearchfilesList(file, oldPath)}}))
        this.view.registerEvent(this.app.metadataCache.on('resolved', () => this.updateUnresolvedFiles()))
    }

    updateSearchBarContainerElState(isActive: boolean){
        this.inputEl.parentElement?.toggleClass('is-active', isActive)
    }

    onOpen(): void {
        this.updateSearchBarContainerElState(this.suggester.getSuggestions().length > 0 ? true : false)    
    }

    onClose(): void {
        this.updateSearchBarContainerElState(false)
    }

    filterSearchFileArray(filterKey: FileType | FileExtension, fileArray: SearchFile[]): SearchFile[]{
        const arrayToFilter = fileArray
        return arrayToFilter.filter(file => isValidExtension(filterKey) ? file.extension === filterKey : file.fileType === filterKey)
    }

    updateUnresolvedFiles(){
        const unresolvedFiles = getUnresolvedMarkdownFiles()
        let newFiles = false
        if(this.files){
            unresolvedFiles.forEach((unresolvedFile) => {
                if(!this.files.includes(unresolvedFile)){
                    this.files.push(unresolvedFile)
                    newFiles = true
                }
            })
            if(newFiles) this.fuzzySearch.updateSearchArray(this.files)
        }
    }

    updateSearchfilesList(file:TFile, oldPath?: string){
        this.app.metadataCache.onCleanCache(() => {
            if(oldPath){
                this.files.splice(this.files.findIndex((f) => f.path === oldPath),1)
                this.files.push(generateSearchFile(file))
            }
            if(file.deleted){
                this.files.splice(this.files.findIndex((f) => f.path === file.path),1)
    
                // if(isUnresolved({name: file.name, path: file.path, basename: file.basename, extension: file.extension})){
                //     this.files.push(generateMarkdownUnresolvedFile(file.path))
                // }
            }
            else{
                const fileIndex = this.files.findIndex((f) => f.path === file.path)
                if(fileIndex === -1){
                    this.files.push(generateSearchFile(file))
                }
                else if(this.files[fileIndex].isUnresolved){
                    this.files[fileIndex] = generateSearchFile(file)
                }
            }
            this.fuzzySearch.updateSearchArray(this.files)
        })
    }

    onNoSuggestion(): void {
        if(!this.activeFilter || this.activeFilter === 'markdown' || this.activeFilter === 'md'){
            const input = this.inputEl.value
            if (!!input) {
                this.suggester.setSuggestions([{
                        item: {
                            name: `${input}.md`,
                            path: `${input}.md`,
                            basename: input,
                            isCreated: false,
                            fileType: 'markdown',
                            extension: 'md',
                        },
                        refIndex: 0,
                        score: 0,
                }])
                this.open()
            }
            else{
                this.close()
            }
        }
        else{
            this.close()
        }
    }
    
    getSuggestions(input: string): Fuse.FuseResult<SearchFile>[] {
        return this.fuzzySearch.rawSearch(input, this.plugin.settings.maxResults)
    }

    useSelectedItem(selectedItem: Fuse.FuseResult<SearchFile>, newTab?: boolean): void {
        if(selectedItem.item.isCreated && selectedItem.item.file){
            this.openFile(selectedItem.item.file, newTab)
        }
        else{
            this.handleFileCreation(selectedItem.item, newTab)
        }
    }

    getDisplayElementProps(suggestion: Fuse.FuseResult<SearchFile>): {nameToDisplay: string, filePath?: string}{
        const nameToDisplay = this.fuzzySearch.getBestMatch(suggestion, this.inputEl.value)
        let filePath: string | undefined = undefined
        if(this.plugin.settings.showPath){
            filePath = suggestion.item.file ? suggestion.item.file.parent.name : getParentFolderFromPath(suggestion.item.path) // Parent folder
        }
        
        return {
            nameToDisplay: nameToDisplay,
            filePath: filePath
        }
    }

    getDisplayElementComponentType(): typeof HomeTabFileSuggestion{
        return HomeTabFileSuggestion
    }

    async handleFileCreation(selectedFile?: SearchFile, newTab?: boolean): Promise<void>{
        let newFile: TFile
        
        if(selectedFile?.isUnresolved){
            const folderPath = selectedFile.path.replace(selectedFile.name, '')
            if(!await this.app.vault.adapter.exists(folderPath)){
                await this.app.vault.createFolder(folderPath)
            }
            newFile = await this.app.vault.create(selectedFile.path, '')
        }
        else{
            const input = this.inputEl.value;
            // If a file with the same filename exists open it
            // Mimics the behaviour of the default quick switcher
            const files = this.files.filter(file => file.fileType === 'markdown')
            if(files.map(file => file.basename).includes(input)){
                const fileToOpen = files.find(f => f.basename === input)?.file
                if(fileToOpen){
                    return this.openFile(fileToOpen, newTab)
                }
            }
            newFile = await this.app.vault.create(normalizePath(`${this.app.fileManager.getNewFileParent('').path}/${input}.md`), '')
        }
        
        
        this.openFile(newFile, newTab)
    }

    openFile(file: TFile, newTab?: boolean): void{
        // TODO Check if file is already open
        if(newTab){
            this.app.workspace.createLeafInTabGroup().openFile(file)
            // this.inputEl.value = ''
        }
        else{
            this.view.leaf.openFile(file);
        }
    }

    setFileFilter(filterKey: FileType | FileExtension): void{
        this.activeFilter = filterKey
        
        this.app.metadataCache.onCleanCache(() => {
            this.fuzzySearch.updateSearchArray(this.filterSearchFileArray(filterKey, this.plugin.settings.markdownOnly ? getSearchFiles(this.plugin.settings.unresolvedLinks) : this.files))
        })
        
        this.suggester.setSuggestions([]) // Reset search suggestions
        this.close()
    }
}
