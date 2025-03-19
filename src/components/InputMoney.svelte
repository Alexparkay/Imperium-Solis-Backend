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