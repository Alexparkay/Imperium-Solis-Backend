<script lang="ts">
  export let icon: string;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let color: string = '';
  export let className: string = '';
  
  // Map size to CSS classes
  const sizeClass = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };
</script>

<span 
  class="material-symbols-outlined {sizeClass[size]} {color} {className}"
  style={color ? `color: ${color};` : ''}
>
  {icon}
</span> 