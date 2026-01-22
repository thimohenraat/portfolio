<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  
  // ============================================================
  // DOM REFERENCES
  // ============================================================
  let container: HTMLDivElement;           // Container div voor Three.js canvas
  let animationId: number = 0;             // ID voor animatie frame (nodig voor cleanup)

  // ============================================================
  // ANIMATION STATE
  // ============================================================
    const clock = new THREE.Clock();
  let animationFinished = false;           // Schakelaar: true = animatie klaar
    let currentScale = 0.1;                  // Huidige schaal van de cylinder (begint klein)
  const STRETCH_SPEED = 0.4;               // Hoe snel de cylinder groeit per frame
  const VISIBLE_WIDTH_MARGIN = 2;          // Extra ruimte buiten scherm voor visueel effect
  
  // ============================================================
  // THREE.JS OBJECTS (worden geïnitialiseerd in onMount)
  // ============================================================
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let cylinder: THREE.Mesh;

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  const getVisibleWidth = (): number => {
    const verticalFovRadians = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(verticalFovRadians / 2) * camera.position.z;
    return visibleHeight * camera.aspect;
  };
  
  // ============================================================
  // THREE.JS INITIALIZATION
  // ============================================================
  const initializeScene = (): void => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); 
    
    camera = new THREE.PerspectiveCamera(
      75,                          
      window.innerWidth / window.innerHeight,
      0.1,                       
      1000                         
    );
    camera.position.z = 10;         
    
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,              // Gladde randen
      alpha: true,                   // Transparante achtergrond
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    
    geometry.translate(0, 0.5, 0);
    
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff88,              
      shininess: 100               
    });
    
    cylinder = new THREE.Mesh(geometry, material);
    
    // Roteer de cylinder 90 graden zodat hij horizontaal ligt
    cylinder.rotation.z = Math.PI / 2;
    
    scene.add(cylinder);
    
    // ============================================================
    // LIGHTING
    // ============================================================
    // Ambient light: basis verlichting van alle kanten
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Directional light: zon-achtige verlichting vanuit een richting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Point light: lamp-achtige verlichting vanaf een punt
    const pointLight = new THREE.PointLight(0x00ff88, 0.5, 100);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);
    
     // Startpositie: rechts buiten scherm
    const initialVisibleWidth = getVisibleWidth();
    cylinder.position.x = initialVisibleWidth / 2;
  };
  
  // ============================================================
  // UPDATE CYLINDER TRANSFORMATIONS
  // ============================================================
  const updateCylinderTransform = (): void => {
    const visibleWidth = getVisibleWidth();
    const targetScale = visibleWidth + VISIBLE_WIDTH_MARGIN;
    
    if (!animationFinished) {
      // Tijdens animatie: update schaal en positie
      cylinder.scale.y = currentScale;
      cylinder.position.x = visibleWidth / 2;
    } else {
      // Na animatie: set direct naar target schaal
      cylinder.scale.y = targetScale;
      cylinder.position.x = visibleWidth / 2;
    }
  };
  
  // ============================================================
  // ANIMATION 
  // ============================================================
  const animate = (): void => {
    // Vraag het volgende frame aan
    animationId = requestAnimationFrame(animate);

    // Gebruik delta (tijd sinds vorig frame) voor constante snelheid
    // Bereken de target schaal (volledige schermbreedte + marge)
    const delta = clock.getDelta(); 
    const visibleWidth = getVisibleWidth();
    const targetScale = visibleWidth + VISIBLE_WIDTH_MARGIN;
    
    // ANIMATIE LOGICA
    if (!animationFinished) {
      if (currentScale < targetScale) {
        // Groei de cylinder
        currentScale += STRETCH_SPEED * delta * 60;;
      } else {
        // Stop de animatie wanneer target bereikt is
        animationFinished = true;
        currentScale = targetScale;
      }
      
      // Update de cylinder transformaties
      updateCylinderTransform();
    }
    
    // Render de scene met camera
    renderer.render(scene, camera);
  };

  // ============================================================
  // RESIZE HANDLER
  // ============================================================
  const handleResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Update camera aspect ratio
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    // Update renderer grootte
    renderer.setSize(width, height);
    
    // Update cylinder transformaties voor nieuwe schermgrootte
    updateCylinderTransform();
  };
  
  // ============================================================
  // CLEANUP
  // ============================================================
  const cleanupThreeResources = (): void => {
    if (typeof window === 'undefined') return;
    // Stop de animatieloop
    if (animationId) cancelAnimationFrame(animationId);
    
    // Verwijder event listener
    window.removeEventListener('resize', handleResize);
    
    // Verwijder Three.js resources
    if (renderer) renderer.dispose();
    
    if (cylinder) {
        cylinder.geometry.dispose();
        if (!Array.isArray(cylinder.material)) {
            cylinder.material.dispose();
        } 
    }
    
    // Verwijder het canvas uit de DOM
    if (container && renderer?.domElement) {
      container.removeChild(renderer.domElement);
    }
  };
  
  // ============================================================
  // SVELTE LIFECYCLE HOOKS
  // ============================================================
  
  /**
   * onMount - Wordt aangeroepen wanneer component in DOM wordt geladen
   */
  onMount(() => {
    // 1. Initialiseer de Three.js scene
    initializeScene();
    
    // 2. Start de animatie
    animate();
    
    // 3. Voeg resize listener toe
    window.addEventListener('resize', handleResize);
    
    // 4. Return cleanup functie voor onDestroy
    return () => cleanupThreeResources();
  });
</script>

<div 
  bind:this={container} 
  class="canvas-container"
  aria-label="3D animated cylinder visualization"
></div>


<style>
  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    
    /* Z-index zorgt ervoor dat het boven andere content staat */
    z-index: 0;
    
    /* Verberg overflow voor een clean fullscreen effect */
    overflow: hidden;
  }
  
  /**
   * Optioneel: Voeg een subtiele gradient overlay toe voor visuele diepte
   */
  .canvas-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    
    /* Radial gradient voor vignette effect */
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      rgba(26, 26, 26, 0.1) 40%,
      rgba(26, 26, 26, 0.3) 100%
    );
    
    /* Zorg dat het boven de canvas komt maar niet interactie blokkeert */
    pointer-events: none;
    z-index: 1;
  }
</style>