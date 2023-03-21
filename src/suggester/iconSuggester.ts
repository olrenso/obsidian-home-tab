import { PopoverTextInputSuggester,  type suggesterViewOptions } from "./suggester"
import type Fuse from 'fuse.js'
import type { App, } from 'obsidian'
import { ArrayFuzzySearch } from "./fuzzySearch"
import { lucideIcons } from "../utils/lucideIcons"
import IconSuggestion from "src/ui/svelteComponents/iconSuggestion.svelte"


export default class iconSuggester extends PopoverTextInputSuggester<Fuse.FuseResult<string>>{
    private iconList: string[]
    private fuzzySearch: ArrayFuzzySearch
    private displayIcon: boolean

    constructor(app: App, inputEl: HTMLInputElement, viewOptions?: suggesterViewOptions, displayIcon?: boolean){
        super(app, inputEl, viewOptions)
        this.iconList = [... lucideIcons]
        this.fuzzySearch = new ArrayFuzzySearch(this.iconList)
        this.displayIcon = displayIcon ?? false
    }

    getSuggestions(input: string): Fuse.FuseResult<string>[] {
        return this.fuzzySearch.filteredSearch(input, 0.25, 15)
    }

    useSelectedItem(selectedItem: Fuse.FuseResult<string>): void {
        this.inputEl.value = selectedItem.item
        this.inputEl.trigger("input")
        this.onInput().then(() => this.close())
    }

    getDisplayElementComponentType(): typeof IconSuggestion{
        return IconSuggestion
    }
    getDisplayElementProps(): {displayIcon: boolean}{
        return {
            displayIcon: this.displayIcon
        }
    }
}