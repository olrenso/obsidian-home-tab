import { PopoverTextInputSuggester,  type suggesterViewOptions } from "./suggester"
import type Fuse from 'fuse.js'
import type { App, } from 'obsidian'
import { ArrayFuzzySearch } from "./fuzzySearch"
import { lucideIcons, type LucideIcon } from "../utils/lucideIcons"
import { addLucideIcon } from "src/utils/htmlUtils"
import IconSuggestion from "src/ui/svelteComponents/iconSuggestion.svelte"


export default class iconSuggester extends PopoverTextInputSuggester<Fuse.FuseResult<string>>{
    private iconList: string[]
    private fuzzySearch: ArrayFuzzySearch
    private displayIcon: boolean | undefined

    constructor(app: App, inputEl: HTMLInputElement, viewOptions?: suggesterViewOptions, displayIcon?: boolean,){
        super(app, inputEl, viewOptions)
        this.iconList = [... lucideIcons]
        this.fuzzySearch = new ArrayFuzzySearch(this.iconList)
        this.displayIcon = displayIcon
    }

    getSuggestions(input: string): Fuse.FuseResult<string>[] {
        return this.fuzzySearch.filteredSearch(input, 0.25, 15)
    }

    useSelectedItem(selectedItem: Fuse.FuseResult<string>): void {
        this.inputEl.value = selectedItem.item;
        this.inputEl.trigger("input")
        this.close()
    }

    getDisplayElementComponentType(): typeof IconSuggestion{
        return IconSuggestion
    }
    getDisplayElementProps(): {}{
        return {}
    }
}