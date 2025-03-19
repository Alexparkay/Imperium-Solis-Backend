<script lang="ts">
  import InfoButton from './InfoButton.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let title: string;
  export let explanation: string;
  export let sources: Array<{name: string, url: string}> = [];
  
  const dispatch = createEventDispatcher();
  
  function handleShowInfo() {
    dispatch('showInfo', {
      title,
      explanation,
      sources
    });
  }
</script>

<div class="flex items-center">
  <div class="mr-2">
    <InfoButton 
      {title}
      {explanation}
      {sources}
      on:showInfo={handleShowInfo}
    />
  </div>
  <slot></slot>
</div> 