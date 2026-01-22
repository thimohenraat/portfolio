<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style global>
  /* Reset */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Base body styling */
  :global(body) {
    color: #fff;
    min-height: 100vh;
    overflow-x: hidden; /* Alleen horizontaal hidden */
  }

  /* Smooth scrolling */
  :global(html) {
    scroll-behavior: smooth;
  }
</style>
