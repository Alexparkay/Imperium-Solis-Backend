<script lang="ts">
  import Icon from './Icon.svelte';
  
  export let month: number = 0;
  export let day: number = 1;
  export let onChange: ((month: number) => void) | undefined = undefined;
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get days in month
  function getDaysInMonth(month: number, year: number = new Date().getFullYear()): number {
    return new Date(year, month + 1, 0).getDate();
  }
  
  // Generate days for current month
  $: daysInMonth = getDaysInMonth(month);
  $: days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Handle month change
  function changeMonth(increment: number) {
    const newMonth = (month + increment + 12) % 12;
    month = newMonth;
    
    // Adjust day if it exceeds days in new month
    const newDaysInMonth = getDaysInMonth(month);
    if (day > newDaysInMonth) {
      day = newDaysInMonth;
    }
    
    if (onChange) {
      onChange(month);
    }
  }
  
  // Handle day selection
  function selectDay(newDay: number) {
    day = newDay;
  }
</script>

<div class="calendar bg-dark-card rounded-xl shadow-dark p-4 border border-dark-border">
  <div class="flex justify-between items-center mb-4">
    <button 
      class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-dark-hover transition-colors duration-200" 
      on:click={() => changeMonth(-1)}
    >
      <Icon icon="chevron_left" color="text-primary-400" />
    </button>
    
    <h3 class="text-lg font-display font-semibold text-dark-text-primary">{monthNames[month]}</h3>
    
    <button 
      class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-dark-hover transition-colors duration-200" 
      on:click={() => changeMonth(1)}
    >
      <Icon icon="chevron_right" color="text-primary-400" />
    </button>
  </div>
  
  <div class="grid grid-cols-7 gap-1">
    {#each ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as dayLabel}
      <div class="text-center text-xs font-medium text-dark-text-tertiary py-1">{dayLabel}</div>
    {/each}
    
    <!-- Empty cells for days before the 1st of the month -->
    {#each Array.from({ length: new Date(new Date().getFullYear(), month, 1).getDay() }) as _}
      <div></div>
    {/each}
    
    <!-- Days of the month -->
    {#each days as dayNum}
      <button
        class="w-9 h-9 rounded-full text-sm flex items-center justify-center transition-all duration-200 
        {day === dayNum 
          ? 'bg-gradient-blue text-white font-medium shadow-glow' 
          : 'hover:bg-dark-hover text-dark-text-secondary'}"
        on:click={() => selectDay(dayNum)}
      >
        {dayNum}
      </button>
    {/each}
  </div>
</div> 