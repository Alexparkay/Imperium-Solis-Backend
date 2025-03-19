<script lang="ts">
  import Icon from './Icon.svelte';
  
  export let value: any;
  export let label: string = '';
  export let expanded: boolean = false;
  
  function toggleExpand() {
    expanded = !expanded;
  }
  
  // Format JSON with indentation
  function formatJSON(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
</script>

<div class="bg-dark-card rounded-xl shadow-dark border border-dark-border overflow-hidden">
  <div class="flex justify-between items-center p-3 cursor-pointer hover:bg-dark-hover transition-colors duration-200" on:click={toggleExpand}>
    <div class="font-mono text-sm font-medium text-dark-text-primary">{label}</div>
    <div class="w-7 h-7 flex items-center justify-center rounded-full bg-dark-panel text-primary-400 transition-transform duration-300 {expanded ? 'rotate-180' : ''}">
      <Icon icon="expand_more" size="small" />
    </div>
  </div>
  
  {#if expanded}
    <div class="border-t border-dark-border">
      <pre class="p-4 text-xs font-mono whitespace-pre overflow-x-auto text-dark-text-secondary bg-dark-panel">{formatJSON(value)}</pre>
    </div>
  {:else}
    <div class="px-3 py-2 text-xs font-mono truncate text-dark-text-tertiary bg-dark-panel border-t border-dark-border">
      {formatJSON(value).substring(0, 100)}...
    </div>
  {/if}
</div> 