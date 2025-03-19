<script lang="ts">
  import Icon from './Icon.svelte';
  import InfoButton from './InfoButton.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let icon: string;
  export let title: string;
  export let rows: Array<{ 
    name: string; 
    value: string; 
    icon?: string; 
    units?: string;
    infoTitle?: string;
    infoExplanation?: string;
    infoSources?: Array<{name: string, url: string}>;
  }> = [];
  export let class_name: string = "";
  
  const dispatch = createEventDispatcher();
  
  function handleShowInfo(event: CustomEvent) {
    dispatch('showInfo', event.detail);
  }
</script>

<div class={`bg-dark-card rounded-xl shadow-dark border border-dark-border overflow-hidden ${class_name}`}>
  <div class="p-4 border-b border-dark-border bg-gradient-dark">
    <div class="flex items-center">
      <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-blue text-white mr-3">
        <Icon icon={icon} size="medium" />
      </div>
      <h3 class="text-lg font-display font-semibold text-dark-text">{title}</h3>
    </div>
  </div>
  
  <div class="p-4">
    {#if rows.length > 0}
      <div class="space-y-3">
        {#each rows as row}
          <div class="flex justify-between items-center py-1 border-b border-dark-border last:border-0">
            <span class="text-sm font-medium text-dark-text flex items-center">
              {#if row.icon}
                <Icon icon={row.icon} className="mr-2" size="small" />
              {/if}
              {row.name}
            </span>
            <span class="text-sm text-dark-text font-medium flex items-center">
              {row.value}
              {#if row.units}
                <span class="text-dark-text-secondary ml-1">{row.units}</span>
              {/if}
              {#if row.infoExplanation}
                <span class="ml-2">
                  <InfoButton 
                    title={row.infoTitle || row.name}
                    explanation={row.infoExplanation}
                    sources={row.infoSources || []}
                    on:showInfo={handleShowInfo}
                  />
                </span>
              {/if}
            </span>
          </div>
        {/each}
      </div>
    {/if}
    
    <div class="mt-4">
      <slot></slot>
    </div>
  </div>
</div> 