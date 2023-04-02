import Fuse from "fuse.js";
import type { TFile } from "obsidian";
import { getImageFiles, getMarkdownSearchFiles} from "src/utils/getFilesUtils";
import type { FileType } from "src/utils/getFileTypeUtils"
import type { SurfingItem } from "./surfingSuggester";

export const DEFAULT_FUSE_OPTIONS: Fuse.IFuseOptions<any> = {
    includeScore : true,
    // includeMatches : true,
    // findAllMatches : true,
    fieldNormWeight : 1.35,
    threshold : 0.2,
    distance: 125,
    useExtendedSearch : true,
}

export interface MarkdownSearchFile{
	name: string
	basename: string
	path: string
	aliases?: string[]
    isCreated: boolean
    file?: TFile
}

export interface SearchFile{
    name: string
    basename: string
    path: string
    aliases?: string[]
    isCreated: boolean
    isUnresolved?: boolean
    file?: TFile
    extension: string
    fileType?: FileType
}

class fuzzySearch<T>{
    private fuse: Fuse<T>

    constructor(searchArray: T[], searchOptions: Fuse.IFuseOptions<T> = DEFAULT_FUSE_OPTIONS){
        this.fuse = new Fuse(searchArray, searchOptions)
    }

    rawSearch(querry: string, limit?: number): Fuse.FuseResult<T>[]{
        return this.fuse.search(querry, limit ? {limit: limit} : undefined)
    }

    filteredSearch(querry: string, scoreThreshold: number = 0.25, maxResults: number = 5){
        return this.rawSearch(querry, maxResults).filter(item => item.score ? item.score < scoreThreshold : true)
    }

    updateSearchArray(newSearchArray: T[]){
        this.fuse.setCollection(newSearchArray)
    }
}

export class ArrayFuzzySearch extends fuzzySearch<string>{
    constructor(searchArray: string[], searchOptions?: Fuse.IFuseOptions<string>){
        super(searchArray, searchOptions)
    }
}

/**
 * @description Search created markdown files by basename and aliases.
 */
export class MarkdownFileFuzzySearch extends fuzzySearch<MarkdownSearchFile>{
    constructor(fileList?: MarkdownSearchFile[], searchOptions?: Fuse.IFuseOptions<MarkdownSearchFile>){
        const searchArray = fileList ?? getMarkdownSearchFiles()
        super(searchArray, searchOptions)
    }

    // Return the best match between the filename and the aliases
    getBestMatch(searchResultElement: Fuse.FuseResult<MarkdownSearchFile>, querry: string): string{
        const searchFile = searchResultElement.item
        if (!searchFile.aliases){
            return searchFile.basename
        }

        const searchArray: string[] = []
        searchArray.push(searchFile.basename)
        searchFile.aliases.forEach((alias) => searchArray.push(alias))

        const fuzzySearch = new ArrayFuzzySearch(searchArray)
        const bestMatch = fuzzySearch.rawSearch(querry, 1)[0]
        
        if(!bestMatch){
            return searchFile.basename
        }

        return bestMatch.item
    }
}

export class FileFuzzySearch extends fuzzySearch<SearchFile>{
    constructor(fileList: SearchFile[], searchOptions?: Fuse.IFuseOptions<SearchFile>){
        const searchArray = fileList
        super(searchArray, searchOptions)
    }

    /**
     * @return Best match between basename and aliases
     */
    getBestMatch(searchResultElement: Fuse.FuseResult<SearchFile>, querry: string): string{
        const searchFile = searchResultElement.item
        // if(searchFile.fileType != 'markdown') return searchFile.name
        
        if (!searchFile.aliases) return searchFile.basename

        const searchArray: string[] = []
        searchArray.push(searchFile.basename)
        searchFile.aliases.forEach((alias) => searchArray.push(alias))

        const fuzzySearch = new ArrayFuzzySearch(searchArray)
        const bestMatch = fuzzySearch.rawSearch(querry, 1)[0]
        
        return bestMatch ? bestMatch.item : searchFile.basename
    }
}

/**
 * @description Search image file.
 * @param imageList Optional list of TFile, if not given the search will be in the entire vault.
 */
export class ImageFileFuzzySearch extends fuzzySearch<TFile>{
    constructor(imageList?: TFile[], searchOptions?: Fuse.IFuseOptions<TFile>){
        const searchArray = imageList ?? getImageFiles()
        super(searchArray, searchOptions)
    }
}

export class SurfingItemFuzzySearch extends fuzzySearch<SurfingItem>{
    constructor(surfingItems: SurfingItem[], searchOptions?: Fuse.IFuseOptions<SurfingItem>){
        super(surfingItems, searchOptions)
    }
}

