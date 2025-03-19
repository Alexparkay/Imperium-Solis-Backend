<script lang="ts">
  import { slide } from 'svelte/transition';
  import Icon from './Icon.svelte';
  
  export let section: string;
  export let icon: string;
  export let title: string;
  export let subtitle: string = '';
  export let infoText: string = '';
  export let advancedSettings: boolean = false;
  
  $: expanded = section === title;
  
  function toggleExpand() {
    section = expanded ? '' : title;
  }
</script>

<div class="expandable">
  <button
    class="w-full p-4 flex justify-between items-center cursor-pointer hover:bg-dark-hover active:bg-dark-active transition-colors"
    on:click={() => (section = section === title ? '' : title)}
    role="button"
    aria-expanded={section === title}
  >
    <div class="flex items-center">
      <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-dark-panel text-white mr-3">
        <Icon {icon} size="medium" />
      </div>
      <div class="text-left">
        <div class="text-lg font-display font-semibold text-white">{title}</div>
        {#if subtitle}
          <div class="text-sm text-white">{subtitle}</div>
        {/if}
      </div>
    </div>

    <div class="flex items-center">
      {#if infoText}
        <button
          class="flex items-center justify-center w-8 h-8 rounded-full text-white hover:bg-dark-hover mr-2 transition-colors"
          on:click|stopPropagation={() => alert(infoText)}
          aria-label="Show information"
        >
          <Icon icon="info" size="small" />
        </button>
      {/if}
      
      {#if advancedSettings}
        <span class="text-xs text-white mr-2 px-2 py-0.5 bg-dark-card rounded-full text-[10px] uppercase tracking-wide">Advanced</span>
      {/if}
      
      <Icon
        icon={section === title ? 'expand_less' : 'expand_more'}
        className="text-2xl text-white transition-transform duration-300"
      />
    </div>
  </button>

  {#if section === title}
    <div transition:slide={{ duration: 300 }} class="text-white">
      <slot />
    </div>
  {/if}
</div>

<style>
  /* Ensure all text within the expandable component is white */
  :global(.expandable) {
    color: white;
  }
  
  :global(.expandable input),
  :global(.expandable select),
  :global(.expandable textarea) {
    color: white !important;
  }
  
  :global(.expandable md-icon) {
    color: white;
  }
</style> 