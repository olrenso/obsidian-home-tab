<script lang="ts">
	import type { Suggester, TextInputSuggester } from "src/suggester/suggester";

    export let index: number
    // export let suggester: Suggester<any>
    export let textInputSuggester: TextInputSuggester<any>
    export let selectedItemIndex: number

    let suggester: Suggester<any> = textInputSuggester.getSuggester()

    export let suggestionItemClass: string | undefined = undefined
    export let suggestionContentClass: string | undefined = undefined
    export let suggestionTitleClass: string | undefined = undefined
    export let suggestionAuxClass: string | undefined = undefined
</script>

<div class="{suggestionItemClass ?? 'suggestion-item mod-complex'}" 
    class:is-selected="{selectedItemIndex === index}"
    on:mousemove="{() => suggester.setSelectedItemIndex(index)}"
    on:click="{() => textInputSuggester.useSelectedItem(suggester.getSelectedItem())}"
    on:auxclick="{(e) => {if(e.button === 1){textInputSuggester.useSelectedItem(suggester.getSelectedItem(), true)}}}">
    <div class="{suggestionContentClass ?? 'suggestion-content'}">
        <div class="{suggestionTitleClass ?? 'suggestion-title'}">
            <slot name="suggestion-title"/>
        </div>
        <slot name="suggestion-extra-content"/>
    </div>
    <div class="{suggestionAuxClass ?? 'suggestion-aux'}">
        <slot name="suggestion-aux"/>
    </div>
</div>