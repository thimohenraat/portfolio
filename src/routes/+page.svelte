<script>
  import CylinderCanvas from '$lib/components/CylinderCanvas.svelte';
</script>

<main>
    <div class="ui-layer">
        <h1>Mijn SvelteKit Project</h1>
        <p>De cilinder groeit op de achtergrond.</p>
    </div>

    <section class="cylinder-section">
        <CylinderCanvas />
    </section>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    overflow: hidden; /* voorkomt scrollbars */
  }

  main {
    position: relative;
    width: 100vw;
    height: 100vh;
  }

  .ui-layer {
    position: absolute;
    top: 2rem;
    left: 2rem;
    z-index: 10; /* boven canvas */
    color: white;
    font-family: system-ui, sans-serif;
    pointer-events: none; /* canvas blijft interactief */
  }
</style>
