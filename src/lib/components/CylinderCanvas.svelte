<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  let container: HTMLDivElement;
  let animationId: number;
  
  // Animation parameters
  const startX = 15;
  const stretchSpeed = 0.3;
  const maxLength = 30;

  onMount(() => {
    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Cylinder - starts as a point
    let cylinderLength = 0.1;
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, cylinderLength, 32);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff88,
      shininess: 100
    });
    
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.rotation.z = Math.PI / 2; // Horizontal orientation
    cylinder.position.x = startX;
    scene.add(cylinder);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Animation loop
    function animate() {
      animationId = requestAnimationFrame(animate);

      if (cylinderLength < maxLength) {
        // Increase length
        cylinderLength += stretchSpeed;
        
        // Update geometry with new length
        cylinder.geometry.dispose();
        cylinder.geometry = new THREE.CylinderGeometry(0.5, 0.5, cylinderLength, 32);
        
        // Move cylinder to the left as it stretches
        // This keeps the right end in place while left end extends
        cylinder.position.x = startX - (cylinderLength / 2);
      }

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    function handleResize() {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (animationId) cancelAnimationFrame(animationId);
    };
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
  });
</script>

<div bind:this={container} class="container"></div>

<style>
  .container {
    width: 100%;
    height: 100vh;
    margin: 0;
  }
</style>