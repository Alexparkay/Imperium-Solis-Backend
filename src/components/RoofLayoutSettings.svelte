<script lang="ts">
  import InputNumber from './InputNumber.svelte';
  import InputBool from './InputBool.svelte';
  import Dropdown from './Dropdown.svelte';
  import Icon from './Icon.svelte';
  
  // Setback settings
  export let edgeSetbackFt = 4.0;
  export let obstructionSetbackFt = 4.0;
  export let walkwayWidthFt = 3.5;
  
  // Layout optimization settings
  export let optimizeLayout = true;
  export let prioritizeOrientation = true;
  
  // Orientation priority options
  const orientationOptions = {
    'south-west-east-north': 'South > West > East > North (Default)',
    'south-east-west-north': 'South > East > West > North',
    'west-south-east-north': 'West > South > East > North',
    'east-south-west-north': 'East > South > West > North'
  };
  
  export let orientationPriority = 'south-west-east-north';
  
  // Jurisdiction presets
  const jurisdictionOptions = {
    'default': 'Default (4ft setbacks)',
    'california': 'California (3ft setbacks)',
    'arizona': 'Arizona (3ft setbacks, 2.5ft walkways)',
    'florida': 'Florida (3ft setbacks, 18in from ridge)',
    'texas': 'Texas (18in from ridge/edge)',
    'custom': 'Custom'
  };
  
  export let selectedJurisdiction = 'default';
  
  // Handle jurisdiction change
  function handleJurisdictionChange(value: string) {
    selectedJurisdiction = value;
    
    // Apply preset values based on jurisdiction
    switch (value) {
      case 'california':
        edgeSetbackFt = 3.0;
        obstructionSetbackFt = 3.0;
        walkwayWidthFt = 3.0;
        break;
      case 'arizona':
        edgeSetbackFt = 3.0;
        obstructionSetbackFt = 3.0;
        walkwayWidthFt = 2.5;
        break;
      case 'florida':
        edgeSetbackFt = 3.0;
        obstructionSetbackFt = 3.0;
        walkwayWidthFt = 3.0;
        break;
      case 'texas':
        edgeSetbackFt = 1.5;
        obstructionSetbackFt = 3.0;
        walkwayWidthFt = 3.0;
        break;
      case 'default':
        edgeSetbackFt = 4.0;
        obstructionSetbackFt = 4.0;
        walkwayWidthFt = 3.5;
        break;
      // Custom - keep current values
    }
  }
</script>

<div class="flex flex-col space-y-6 p-5 backdrop-blur bg-dark-card/90 rounded-xl shadow-dark border border-dark-border">
  <div class="flex items-center">
    <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-blue text-white mr-3">
      <Icon icon="grid_view" size="medium" />
    </div>
    <h3 class="text-lg font-display font-semibold text-dark-text-primary">Roof Layout Settings</h3>
  </div>
  
  <div class="mb-2">
    <Dropdown
      label="Jurisdiction"
      value={selectedJurisdiction}
      options={jurisdictionOptions}
      onChange={handleJurisdictionChange}
    />
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <InputNumber
      bind:value={edgeSetbackFt}
      icon="straighten"
      label="Edge Setback"
      suffix="ft"
      min={1}
      max={10}
      step={0.5}
    />
    
    <InputNumber
      bind:value={obstructionSetbackFt}
      icon="highlight_alt"
      label="Obstruction Clearance"
      suffix="ft"
      min={1}
      max={10}
      step={0.5}
    />
    
    <InputNumber
      bind:value={walkwayWidthFt}
      icon="directions_walk"
      label="Walkway Width"
      suffix="ft"
      min={2}
      max={6}
      step={0.5}
    />
  </div>
  
  <div class="mt-2 pt-4 border-t border-dark-border">
    <h4 class="text-md font-display font-medium text-dark-text-primary mb-3">Layout Optimization</h4>
    <div class="space-y-4">
      <InputBool
        bind:value={optimizeLayout}
        label="Optimize panel layout for grid alignment"
      />
      
      <InputBool
        bind:value={prioritizeOrientation}
        label="Prioritize optimal orientation"
      />
      
      {#if prioritizeOrientation}
        <div class="mt-3 pl-4 border-l-2 border-primary-700">
          <Dropdown
            label="Orientation Priority"
            bind:value={orientationPriority}
            options={orientationOptions}
          />
        </div>
      {/if}
    </div>
  </div>
</div> 