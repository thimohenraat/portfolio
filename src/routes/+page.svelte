<script>
  import CylinderAnimation from '$lib/components/cylinder/CylinderAnimation.svelte';
  import Carousel from '$lib/components/Carousel.svelte';
  import Header from '$lib/components/Header.svelte';
</script>

<CylinderAnimation />
<main>
  <Carousel />
</main>

<style>
  main {
    position: relative;
    z-index: 1;
    /* Zorg dat de main pas begint na de eerste viewport als je wilt scrollen */
    margin-top: 0;
  }
</style>
