<script lang="ts">
  import Icon from './Icon.svelte';
  
  export let value: boolean;
  export let label: string = '';
  export let onChange: (() => void) | undefined = undefined;
  
  function handleChange() {
    value = !value;
    if (onChange) {
      onChange();
    }
  }
</script>

<div class="flex items-center space-x-3">
  <div class="relative">
    <input
      type="checkbox"
      id={`checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`}
      bind:checked={value}
      on:change={handleChange}
      class="sr-only peer"
    />
    <div class="w-11 h-6 bg-dark-border peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-panel after:border-dark-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-blue"></div>
  </div>
  
  {#if label}
    <label
      for={`checkbox-${label.replace(/\s+/g, '-').toLowerCase()}`}
      class="text-sm font-medium text-dark-text-secondary cursor-pointer"
    >
      {label}
    </label>
  {/if}
</div> 