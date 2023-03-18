<script lang="ts">
    import { quintOut } from 'svelte/easing'
    import { slide } from 'svelte/transition'
	import type { Suggester, TextInputSuggester, suggesterViewOptions } from '../suggester/suggester';

    export let suggester: Suggester<any>
    export let options: suggesterViewOptions
    export let textInputSuggester: TextInputSuggester<any>

    let suggestions: any[]
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
            {#each suggestions as suggestion, index (suggestion)}
                <svelte:component this={textInputSuggester.getDisplayElementComponentType()}
                    {index} {suggestion} {suggester} {textInputSuggester} {selectedItemIndex}
                    {... textInputSuggester.getDisplayElementProps(suggestion)}/>
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