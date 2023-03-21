import { PopoverTextInputSuggester,  type suggesterViewOptions } from "./suggester"
import type Fuse from 'fuse.js'
import type { App, } from 'obsidian'
import { ArrayFuzzySearch } from "./fuzzySearch"
import { getFonts } from 'font-list'
import FontSuggestion from "src/ui/svelteComponents/fontSuggestion.svelte";

export default class fontSuggester extends PopoverTextInputSuggester<Fuse.FuseResult<string>>{
    private fontList: string[]
    private fuzzySearch: ArrayFuzzySearch
    private renderFont: boolean | undefined

    constructor(app: App, inputEl: HTMLInputElement, viewOptions?: suggesterViewOptions, renderFont?: boolean,){
        super(app, inputEl, viewOptions)
        this.renderFont = renderFont

        this.getInstalledFonts().then(fontList => this.fuzzySearch = new ArrayFuzzySearch(fontList))
    }

    async getInstalledFonts(): Promise<string[]>{
        if(!this.fontList){
            this.fontList = await getFonts()
        }
        return this.fontList
    }

    getSuggestions(input: string): Fuse.FuseResult<string>[] {
        return this.fuzzySearch.filteredSearch(input, 0.25, 15)
    }

    useSelectedItem(selectedItem: Fuse.FuseResult<string>): void {
        this.inputEl.value = selectedItem.item.replace(/"/g, ``)
        this.inputEl.trigger("input")
        this.onInput().then(() => this.close())
    }

    getDisplayElementComponentType(): typeof FontSuggestion{
        return FontSuggestion
    }

    getDisplayElementProps(suggestion: Fuse.FuseResult<string>): {renderFont: boolean, suggestionTitle: string}{
        return {
            renderFont: this.renderFont ?? false,
            suggestionTitle: suggestion.item.replace(/"/g, ``),
        }
    }

    onNoSuggestion(): void {
        const input = this.inputEl.value
        // If the input is blank display all installed fonts
        if (!input){
            const suggestions: Fuse.FuseResult<string>[] = []
            this.fontList.forEach(font => {
                suggestions.push({
                    item: font,
                    refIndex: 0,
                    score: 0,
                })
            })
            this.suggester.setSuggestions(suggestions)
            this.open()
        }
        else{
            this.close()
        }
    }
}