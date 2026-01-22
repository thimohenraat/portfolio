<script>
  import CylinderCanvas from '$lib/components/cylinder/CylinderCanvas.svelte';
</script>

<main>
  <div class="ui-layer">
    <h1>Mijn Portfolio</h1>
    <p>De cilinder groeit op de achtergrond.</p>
  </div>

  <!-- Cylinder Canvas sectie -->
  <section class="cylinder-section">
    <CylinderCanvas />
  </section>
</main>

<style>
  main {
    position: relative;
    width: 100%;
    height: 100%;
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
