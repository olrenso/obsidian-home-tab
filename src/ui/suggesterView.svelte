<script lang="ts">
    import type Fuse from 'fuse.js'
    import type { TFile } from 'obsidian'
    import { quintOut } from 'svelte/easing'
    import { slide } from 'svelte/transition'
	import type { Suggester, TextInputSuggester, suggesterViewOptions } from '../suggester/suggester';

    export let suggester: Suggester<any>
    export let options: suggesterViewOptions
    export let textInputSuggester: TextInputSuggester<any>

    let suggestions: Fuse.FuseResult<TFile>[]
    suggester.suggestionsStore.subscribe((value) => suggestions = value)
    let selectedItemIndex: number
    suggester.selectedItemIndexStore.subscribe((value) => selectedItemIndex = value)
    const suggestionWrapper = suggester.suggestionsContainer
</script>

{#if suggestions && suggestions.length > 0}
    <div class="{options.containerClass ?? 'suggestion-container'}" 
        on:mousedown="{(e) => e.preventDefault()}"
        transition:slide={{duration:200, easing: quintOut}}>
        <div class="{options.suggestionClass ?? 'suggestion'} {options.additionalClasses ?? ''}" class:scrollable="{options.isScrollable}"
            style="{options.style ?? ''}" bind:this={$suggestionWrapper}>
            {#each suggestions as suggestion, index}
                <div class="{options.suggestionItemClass ?? 'suggestion-item mod-complex'}" class:is-selected="{selectedItemIndex === index}" 
                    on:mousemove="{() => suggester.setSelectedItemIndex(index)}"
                    on:click="{() => textInputSuggester.useSelectedItem(suggester.getSelectedItem())}"
                    on:auxclick="{(e) => {if(e.button === 1){textInputSuggester.useSelectedItem(suggester.getSelectedItem(), true)}}}">
                    <!-- transition:slide={{duration: 200, easing: quintOut}}> -->
                    {#each textInputSuggester.generateDisplayElementContent(suggestion) as element}
                        {@html element.outerHTML}
                    {/each}
                </div>
            {/each}
        </div>
        {#if options.additionalModalInfo}
            <div class="suggester-additional-info">
                {@html options.additionalModalInfo.outerHTML}
            </div>
        {/if}
    </div>
{/if}
    

<style>
    .scrollable{
        overflow-y: auto;
    }
</style>