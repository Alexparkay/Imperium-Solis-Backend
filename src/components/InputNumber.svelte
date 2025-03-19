<script lang="ts">
  import Icon from './Icon.svelte';
  
  export let value: number;
  export let label: string = '';
  export let icon: string = '';
  export let suffix: string = '';
  export let prefix: string = '';
  export let min: number = 0;
  export let max: number = 100;
  export let step: number = 1;
  
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue = parseFloat(target.value);
    
    if (!isNaN(newValue)) {
      // Ensure value is within min/max bounds
      value = Math.min(Math.max(newValue, min), max);
    }
  }
</script>

<style>
  /* Override Material Web Components styles to ensure text is visible */
  :global(md-outlined-text-field) {
    --md-sys-color-on-surface: #1f2937;  /* gray-800 for dark text */
    --md-sys-color-on-surface-variant: #4b5563;  /* gray-600 for labels */
    --md-sys-color-outline: #9ca3af;  /* gray-400 for outline */
    --md-sys-color-primary: #2563eb;  /* blue-600 for focus */
    --md-outlined-text-field-input-text-color: #1f2937;
    --md-outlined-text-field-label-text-color: #4b5563;
    --md-outlined-text-field-outline-color: #9ca3af;
    --md-outlined-text-field-hover-outline-color: #6b7280;
    --md-outlined-text-field-focus-outline-color: #2563eb;
    --md-outlined-text-field-caret-color: #2563eb;
  }

  :global(md-outlined-text-field input) {
    color: #1f2937 !important;
  }

  :global(md-outlined-text-field .prefix-text),
  :global(md-outlined-text-field .suffix-text) {
    color: #4b5563 !important;
  }
</style>

<div class="flex flex-col space-y-2">
  {#if label}
    <label class="text-sm font-medium text-dark-text-secondary">{label}</label>
  {/if}
  
  <div class="flex items-center space-x-3">
    {#if icon}
      <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-blue text-white flex-shrink-0">
        <Icon icon={icon} size="small" />
      </div>
    {/if}
    
    <div class="flex-1 relative group">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {#if prefix}
          <span class="text-dark-text-tertiary">{prefix}</span>
        {/if}
      </div>
      
      <input
        type="number"
        bind:value={value}
        on:input={handleInput}
        min={min}
        max={max}
        step={step}
        class="w-full px-3 py-2.5 {prefix ? 'pl-7' : ''} {suffix ? 'pr-12' : ''} bg-dark-panel border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-all duration-200 outline-none group-hover:border-primary-500 text-dark-text-primary"
      />
      
      {#if suffix}
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span class="text-dark-text-tertiary">{suffix}</span>
        </div>
      {/if}
    </div>
  </div>
</div> 