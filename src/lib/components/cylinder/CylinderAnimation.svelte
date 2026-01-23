<script lang="ts">
  import { onMount } from 'svelte';
  import { CylinderEngine } from '$lib/engines/cylinder/CylinderEngine';
  import { DEFAULT_CONFIG } from '$lib/types/cylinder';
  import type { CylinderConfig } from '$lib/types/cylinder';

  export let options: Partial<CylinderConfig> = {};

  let container: HTMLDivElement;
  let engine: CylinderEngine;

  onMount(() => {
    engine = new CylinderEngine(container, { ...DEFAULT_CONFIG, ...options });
    engine.animate();

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
  });
</script>

<div bind:this={container} class="animation-container"></div>

<style>
  .animation-container {
    position: fixed;
    inset: 0;
    z-index: 0;
    background: #0a0a2a;
    overflow: hidden;
  }
</style>
