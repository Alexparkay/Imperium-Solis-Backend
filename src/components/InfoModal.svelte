<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Icon from './Icon.svelte';
  
  export let title: string = 'Calculation Details';
  export let content: string = '';
  export let sources: Array<{name: string, url: string}> = [];
  
  const dispatch = createEventDispatcher();
  
  function close() {
    dispatch('close');
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
  <div class="bg-[#121212] rounded-xl shadow-dark border border-[#333333] w-full max-w-2xl max-h-[90vh] flex flex-col">
    <div class="p-4 border-b border-[#333333] flex justify-between items-center bg-[#1E1E1E]">
      <h3 class="text-lg font-display font-semibold text-white">{title}</h3>
      <button 
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2A2A2A] text-gray-300 hover:text-white"
        on:click={close}
      >
        <Icon icon="close" size="medium" />
      </button>
    </div>
    
    <div class="p-4 overflow-y-auto bg-[#121212] text-[#e2e8f0]">
      <div class="dark-content">
        {@html content}
      </div>
      
      {#if sources.length > 0}
        <div class="mt-6 pt-4 border-t border-[#333333]">
          <h4 class="text-sm font-semibold text-gray-300 mb-2">Data Sources</h4>
          <ul class="text-sm space-y-1">
            {#each sources as source}
              <li>
                <a href={source.url} target="_blank" rel="noopener noreferrer" class="text-[#38bdf8] hover:text-[#7dd3fc]">
                  {source.name}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
    
    <div class="p-4 border-t border-[#333333] bg-[#1E1E1E]">
      <button 
        class="w-full py-2 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg transition-colors"
        on:click={close}
      >
        Close
      </button>
    </div>
  </div>
</div>

<style>
  /* Direct styling for content */
  :global(.dark-content) {
    color: #e2e8f0;
  }
  
  :global(.dark-content strong) {
    color: #f8fafc;
    font-weight: 600;
  }
  
  :global(.dark-content h1),
  :global(.dark-content h2),
  :global(.dark-content h3),
  :global(.dark-content h4),
  :global(.dark-content h5),
  :global(.dark-content h6) {
    color: #f8fafc;
    font-weight: 600;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  
  :global(.dark-content p) {
    margin-bottom: 1em;
    color: #e2e8f0;
  }
  
  :global(.dark-content ul),
  :global(.dark-content ol) {
    color: #e2e8f0;
    padding-left: 1.5em;
    margin-bottom: 1em;
  }
  
  :global(.dark-content ul) {
    list-style-type: disc;
  }
  
  :global(.dark-content ol) {
    list-style-type: decimal;
  }
  
  :global(.dark-content li) {
    margin-bottom: 0.5em;
  }
  
  :global(.dark-content blockquote) {
    color: #e2e8f0;
    border-left: 4px solid #475569;
    padding-left: 1em;
    margin-left: 0;
    margin-right: 0;
    font-style: italic;
  }
  
  :global(.dark-content a) {
    color: #38bdf8;
    text-decoration: underline;
    font-weight: 500;
  }
  
  :global(.dark-content a:hover) {
    color: #7dd3fc;
  }
  
  :global(.dark-content code) {
    color: #f8fafc;
    background-color: rgba(71, 85, 105, 0.4);
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-family: monospace;
  }
  
  :global(.dark-content pre) {
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 1em;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-bottom: 1em;
  }
  
  :global(.dark-content hr) {
    border-color: #334155;
    margin: 1.5em 0;
  }
  
  :global(.dark-content table) {
    color: #e2e8f0;
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1em;
  }
  
  :global(.dark-content th) {
    color: #f8fafc;
    border-bottom: 1px solid #475569;
    padding: 0.5em;
    text-align: left;
  }
  
  :global(.dark-content td) {
    border-bottom: 1px solid #334155;
    padding: 0.5em;
  }
</style> 