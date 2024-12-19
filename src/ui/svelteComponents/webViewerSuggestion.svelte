<script lang="ts">
    import { Globe } from 'lucide-svelte';
    import Suggestion from './suggestion.svelte';
    import type { TextInputSuggester } from "src/suggester/suggester";

    export let url: string;
    export let index: number;
    export let selectedItemIndex: number;
    export let textInputSuggester: TextInputSuggester<any>;
    
    // Format the displayed URL
    function formatUrl(url: string): string {
        // Remove protocol prefix
        return url.replace(/^https?:\/\//, '');
    }
</script>

<Suggestion {index} {textInputSuggester} {selectedItemIndex}>
    <svelte:fragment slot="suggestion-title">
        <span>Open link: {formatUrl(url)}</span>
    </svelte:fragment>
    <svelte:fragment slot="suggestion-aux">
        <div class="home-tab-suggestion-filepath">
            <Globe size={15}/>
            <span>WebViewer</span>
        </div>
    </svelte:fragment>
</Suggestion>
