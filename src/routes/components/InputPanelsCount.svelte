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
  import type { MdSlider } from '@material/web/slider/slider';
  import type { SolarPanelConfig } from '../solar';

  export let configId: number;
  export let solarPanelConfigs: SolarPanelConfig[];

  function onChange(event: Event) {
    const target = event.target as MdSlider;
    configId = target.value ?? 0;
  }
</script>

<div>
  <table class="table-auto w-full body-medium text-black">
    <tr>
      <td class="text-black"><md-icon>solar_power</md-icon> </td>
      <th class="pl-2 text-left text-black">Panels count</th>
      <td class="pl-2 text-right text-black">
        <span>{solarPanelConfigs[configId].panelsCount} panels</span>
      </td>
    </tr>
  </table>

  <md-slider
    class="w-full"
    value={configId}
    min={0}
    max={solarPanelConfigs.length - 1}
    on:change={onChange} 
  />
</div>

<style>
  /* Override Material Web Components styles to ensure slider is visible */
  :global(md-slider) {
    --md-sys-color-primary: #000000;
    --md-sys-color-on-primary: #ffffff;
    --md-sys-color-on-surface: #000000;
    --md-sys-color-on-surface-variant: #000000;
    --md-slider-active-track-color: #000000;
    --md-slider-handle-color: #000000;
    --md-slider-inactive-track-color: rgba(0, 0, 0, 0.5);
    --md-slider-with-tick-marks-active-container-color: #ffffff;
    --md-slider-with-tick-marks-inactive-container-color: #000000;
  }
</style>
