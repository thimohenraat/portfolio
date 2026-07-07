<script lang="ts">
  import favicon from '$lib/assets/t.png';

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
    font-family: 'Atkinson Hyperlegible Next', sans-serif;
    font-optical-sizing: auto;
    font-style: normal;
    color: #111; /* Een diepgrijze kleur leest fijner dan puur zwart */

    text-shadow:
      -1px -1px 0 #fcfeff,
      1px -1px 0 #fcfeff,
      -1px 1px 0 #fcfeff,
      1px 1px 0 #fcfeff,
      -2px 0 0 #fcfeff,
      2px 0 0 #fcfeff,
      0 -2px 0 #fcfeff,
      0 2px 0 #fcfeff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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

  :global(h1, h2, h3, h4, h5, h6) {
    font-family: inherit;
    font-weight: 800;
  }
</style>
