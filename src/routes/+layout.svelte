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
    min-height: 100vh;
    overflow-x: hidden; /* Alleen horizontaal hidden */
    background-color: #fcfeff;
  }

  /* Smooth scrolling */
  :global(html) {
    scroll-behavior: smooth;
  }

  :global(html),
  :global(body) {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }
</style>
