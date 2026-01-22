<script lang="ts">
  import { onMount } from 'svelte';
  import { CylinderEngine } from './CylinderEngine';
  import { DEFAULT_CONFIG } from './types';

  let container: HTMLDivElement;
  let engine: CylinderEngine;

  onMount(() => {
    // Initialiseer de class
    engine = new CylinderEngine(container, DEFAULT_CONFIG);
    engine.animate();

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
  });
</script>

<div bind:this={container} class="canvas-container"></div>

<style>
  .canvas-container {
    position: fixed;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }
</style>
