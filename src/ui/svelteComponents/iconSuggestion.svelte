<script lang="ts">
    import type Fuse from 'fuse.js'
	import { getIcon } from 'obsidian';
	import type { Suggester, TextInputSuggester } from "src/suggester/suggester";
	import Suggestion from "./suggestion.svelte";

    export let index: number
    export let suggester: Suggester<string>
    export let textInputSuggester: TextInputSuggester<string>
    export let selectedItemIndex: number
    export let suggestion: Fuse.FuseResult<string>

</script>

<Suggestion {index} {suggester} {textInputSuggester} {selectedItemIndex}>
    <svelte:fragment slot="suggestion-title">{suggestion.item}</svelte:fragment>
    <svelte:fragment slot="suggestion-aux">
        <span class="suggestion-flair">
            {@html getIcon(suggestion.item, 20)?.outerHTML}
        </span>
    </svelte:fragment>
</Suggestion>
