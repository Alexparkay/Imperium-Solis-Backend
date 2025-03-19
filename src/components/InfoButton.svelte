<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from './Icon.svelte';
  
  export let title: string;
  export let explanation: string;
  export let sources: Array<{name: string, url: string}> = [];
  export let size: 'small' | 'medium' = 'small';
  
  const dispatch = createEventDispatcher();
  
  function showInfo() {
    dispatch('showInfo', {
      title,
      explanation,
      sources
    });
  }
</script>

<button
  class={`flex items-center justify-center ${size === 'small' ? 'w-5 h-5' : 'w-6 h-6'} rounded-full text-dark-text-secondary hover:bg-dark-hover hover:text-primary-400 transition-colors`}
  on:click={showInfo}
  aria-label="Show information about {title}"
>
  <Icon icon="info" size={size} />
</button> 