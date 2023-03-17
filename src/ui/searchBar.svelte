<script lang="ts">
    import type { HomeTabSearchBar } from "../homeView";

    export let HomeTabSearchBar: HomeTabSearchBar
    export let embedded: boolean = false
    const searchBarEl = HomeTabSearchBar.searchBarEl
    const activeExtEl = HomeTabSearchBar.activeExtEl
    const container = HomeTabSearchBar.suggestionContainerEl
</script>

<div class="home-tab-searchbar-container" bind:this={$container}>
    <div class="home-tab-searchbar"
        class:embedded={embedded}
        style:width={embedded ? "85%" : "50%"}>
        <div class='nav-file-tag home-tab-suggestion-file-tag hide' bind:this={$activeExtEl}>PNG</div>
        <input type="search" spellcheck="false" placeholder="Type to start search..." bind:this={$searchBarEl}>
    </div>
</div>

<style>
    .home-tab-searchbar-container{
        display: flex;
        align-items: center;
        flex-direction: column;
    }
    
    .home-tab-searchbar{
        display: flex;
        /* width: 50%; */
        min-width: 250px;
        max-width: 700px;
        margin: 0 auto;

        height: calc(var(--input-height)*1.25);

        background-color: var(--background-modifier-form-field);
        border: var(--input-border-width) solid var(--background-modifier-border);
        padding: var(--size-2-3);
        border-radius: var(--input-radius);
        outline: none;
    }

    .home-tab-searchbar input{
        width: 100%;
        height: 100%;
        box-shadow: none;
        font-size: var(--font-ui-medium);
        background: none;
        border: none;
        padding-left: 12px;
    }
    .home-tab-searchbar input:hover{
        background: none;
        border: none;
    }

    .home-tab-suggestion-file-tag.hide{
        display: none;
    }
</style>

<!--     .home-tab-searchbar{
        display: flex;
        align-items: center;
        justify-content: center;
        height: calc(var(--input-height)*1.25);
    }

    .home-tab-searchbar input{
        width: 50%;
        min-width: 250px;
        max-width: 700px;
        display: inline-block;
        margin: 0 auto;
        height: 100%;
        box-shadow: none;
        padding: 6px 18px;
        font-size: var(--font-ui-medium);
    }

    .home-tab-searchbar input:focus, .home-tab-searchbar input:active{
        border-color: var(--background-modifier-border);
    }
 -->