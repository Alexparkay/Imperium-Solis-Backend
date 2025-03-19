<script lang="ts">
  import Icon from './Icon.svelte';
  
  export let value: string;
  export let options: Record<string, string>;
  export let label: string = '';
  export let onChange: ((value: string) => void) | undefined = undefined;
  
  let opened = false;
</script>

<div class="flex flex-col space-y-2">
  {#if label}
    <label class="text-sm font-medium text-dark-text-secondary">{label}</label>
  {/if}
  
  <div class="relative">
    <md-outlined-button
      class="w-full text-black"
      trailing-icon
      role={undefined}
      on:click={() => (opened = !opened)}
    >
      <div class="flex items-center">
        {value !== undefined ? options[value] : 'Choose an option'}
        <md-icon slot="icon">{opened ? 'expand_less' : 'expand_more'}</md-icon>
      </div>
    </md-outlined-button>

    {#if opened}
      <div
        class="fixed top-0 left-0 w-full h-full z-10"
        role={undefined}
        on:click={() => (opened = false)}
      />

      <div
        class="absolute w-full p-2 rounded-lg shadow-xl z-20 bg-dark-panel border border-dark-border"
      >
        <div />
        {#each Object.keys(options) as option}
          <button
            class="dropdown-item block px-4 py-2 w-full text-left rounded text-black hover:bg-dark-hover hover:text-black transition-colors duration-200"
            on:click={() => {
              value = option;
              opened = false;
              if (onChange) onChange(value);
            }}
          >
            {options[option]}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .dropdown-item {
    background-color: transparent;
  }
  .dropdown-item:hover {
    background-color: var(--md-sys-color-surface-variant);
  }
</style> 