<script lang="ts">
  import { onMount } from 'svelte';
  import * as THREE from 'three';

  let container: HTMLDivElement;
  let animationId: number;

  onMount(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 1. De "Anker" truc: Cilinder groeit vanaf één kant
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    geometry.translate(0, 0.5, 0); 

    const material = new THREE.MeshPhongMaterial({ color: 0x00ff88, shininess: 100 });
    const cylinder = new THREE.Mesh(geometry, material);
    
    // Kantel hem horizontaal
    cylinder.rotation.z = Math.PI / 2; 
    scene.add(cylinder);

    // 2. Functie om de cilinder precies aan de rand te zetten
    const updatePositioning = () => {
      // Bereken hoe breed het scherm is in Three.js eenheden op de huidige camera afstand
      const vFov = (camera.fov * Math.PI) / 180;
      const visibleHeight = 2 * Math.tan(vFov / 2) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;

      // Zet de cilinder precies op de rechterrand
      cylinder.position.x = visibleWidth / 2;
      
      // De maxScale moet nu minimaal de hele visibleWidth overbruggen
      return visibleWidth + 2; // +2 voor een kleine overscan
    };

    let maxScale = updatePositioning();

    // 3. Licht
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 4. Animatie
    let currentScale = 0.1;
    function animate() {
      animationId = requestAnimationFrame(animate);
      if (currentScale < maxScale) {
        currentScale += 0.4;
        cylinder.scale.y = currentScale;
      }
      renderer.render(scene, camera);
    }
    animate();

    // 5. Resize handler (zorgt dat hij ook bij resizen beeldvullend blijft)
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      maxScale = updatePositioning();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  });
</script>

<div bind:this={container} class="canvas-container"></div>

<style>
  :global(body) { margin: 0; padding: 0; overflow: hidden; }
  .canvas-container {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
  }
</style>