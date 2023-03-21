import { PopoverTextInputSuggester, type suggesterViewOptions } from "./suggester";
import type Fuse from "fuse.js";
import type { App, TFile } from "obsidian";
import { DEFAULT_FUSE_OPTIONS, ImageFileFuzzySearch } from "./fuzzySearch";
import FileSuggestion from "src/ui/svelteComponents/fileSuggestion.svelte";

export default class ImageFileSuggester extends PopoverTextInputSuggester<Fuse.FuseResult<TFile>>{
    private fuzzySearch: ImageFileFuzzySearch

    constructor(app: App, inputEl: HTMLInputElement, viewOptions?: suggesterViewOptions){
        super(app, inputEl, viewOptions)
        this.fuzzySearch = new ImageFileFuzzySearch(undefined, {...DEFAULT_FUSE_OPTIONS, ignoreLocation: true, keys: ['name']})
    }

    getSuggestions(input: string): Fuse.FuseResult<TFile>[] {
        return this.fuzzySearch.filteredSearch(input, 0.25, 15)
    }

    useSelectedItem(selectedItem: Fuse.FuseResult<TFile>): void {
        this.inputEl.value = selectedItem.item.path
        this.inputEl.trigger("input")
        this.onInput().then(() => this.close())
    }

    getDisplayElementComponentType(): typeof FileSuggestion{
        return FileSuggestion
    }
    getDisplayElementProps(suggestion: Fuse.FuseResult<TFile>): {displayName: string}{
        return {displayName: suggestion.item.name}
    }
}