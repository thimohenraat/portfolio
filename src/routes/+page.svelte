<script>
  import CylinderAnimation from '$lib/components/cylinder/CylinderAnimation.svelte';
  import Carousel from '$lib/components/ProjectCarousel/ProjectCarousel.svelte';
  import Header from '$lib/components/Header.svelte';
  import AboutSection from '$lib/components/about/AboutSection.svelte';
</script>

<CylinderAnimation />
<main>
  <Header />
  <AboutSection />
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
