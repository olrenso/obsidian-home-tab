<script lang="ts">
    import type Fuse from 'fuse.js'
	import { getIcon } from 'obsidian';
	import type { TextInputSuggester } from "src/suggester/suggester";
	import Suggestion from "./suggestion.svelte";

    export let index: number
    export let textInputSuggester: TextInputSuggester<string>
    export let selectedItemIndex: number
    export let suggestion: Fuse.FuseResult<string>

    export let displayIcon: boolean

</script>

<Suggestion {index} {textInputSuggester} {selectedItemIndex}>
    <svelte:fragment slot="suggestion-title">{suggestion.item}</svelte:fragment>
    <svelte:fragment slot="suggestion-aux">
        {#if displayIcon}
            <span class="suggestion-flair">
                {@html getIcon(suggestion.item)?.outerHTML}
            </span>
        {/if}
    </svelte:fragment>
</Suggestion>
