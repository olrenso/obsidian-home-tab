<script lang="ts">
    import type Fuse from 'fuse.js'
	import type { TextInputSuggester } from "src/suggester/suggester";
	import Suggestion from "./suggestion.svelte";

    export let index: number
    export let textInputSuggester: TextInputSuggester<string>
    export let selectedItemIndex: number

    export let suggestion: Fuse.FuseResult<string>
    
    export let renderFont: boolean
    export let suggestionTitle: string

</script>

<Suggestion {index} {textInputSuggester} {selectedItemIndex}>
    <svelte:fragment slot="suggestion-title">
        <span style="{renderFont ? `font-family: ${suggestion.item}` : ''}">
            {suggestionTitle}
        </span>
    </svelte:fragment>
</Suggestion>