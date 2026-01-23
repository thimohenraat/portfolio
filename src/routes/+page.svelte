<script>
  import CylinderAnimation from '$lib/components/cylinder/CylinderAnimation.svelte';
</script>

<CylinderAnimation options={{ color: 0x00ffff, animationSpeed: 0.5 }} />

<main>
  <h1>Cylinder Animation</h1>
</main>

<style>
  main {
    position: relative;
    z-index: 1;
    color: white;
    padding: 2rem;
    font-family: sans-serif;
  }
</style>
