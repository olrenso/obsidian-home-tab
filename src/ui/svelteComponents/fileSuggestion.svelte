<script lang="ts">
    import type Fuse from 'fuse.js'
	import type { TFile } from 'obsidian';
	import type { TextInputSuggester } from "src/suggester/suggester";
	import Suggestion from "./suggestion.svelte";

    export let index: number
    export let textInputSuggester: TextInputSuggester<TFile>
    export let selectedItemIndex: number
    export let suggestion: Fuse.FuseResult<TFile>

    export let displayName: string | undefined = undefined
</script>

<Suggestion {index} {textInputSuggester} {selectedItemIndex}>
    <svelte:fragment slot="suggestion-title">{displayName ?? suggestion.item.basename}</svelte:fragment>
</Suggestion>
