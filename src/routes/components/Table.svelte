<!--
 Copyright 2023 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 -->

<script lang="ts">
  export let rows: {
    name: string;
    value: string;
    units?: string;
    icon?: string;
    tooltip?: string;
    onInfoClick?: () => void;
  }[] = [];
</script>

<div class="flex flex-col space-y-2">
  {#each rows as row}
    <div class="flex items-center space-x-2">
      {#if row.icon}
        <md-icon class="w-8">{row.icon}</md-icon>
      {/if}
      <div class="grow flex items-center gap-1">
        <span>{row.name}</span>
        {#if row.tooltip}
          {#if row.onInfoClick}
            <md-icon class="text-sm cursor-pointer" title={row.tooltip} on:click={row.onInfoClick}>info</md-icon>
          {:else}
            <md-icon class="text-sm" title={row.tooltip}>info</md-icon>
          {/if}
        {/if}
      </div>
      <div class="flex items-center gap-1">
        <span>{row.value}</span>
        {#if row.units}
          <span class="text-sm">{row.units}</span>
        {/if}
      </div>
    </div>
  {/each}
</div>
