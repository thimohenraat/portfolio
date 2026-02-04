<script>
  import BigTitles from './AboutTitles.svelte';
  import AboutText from './AboutText.svelte';
</script>

<section id="about">
  <BigTitles />
  <div class="text-container">
    <AboutText />
  </div>
</section>

<style>
  #about {
    width: 100%;
    padding: 100px 0;
    display: flex;
    flex-direction: row;
    gap: 40px;
  }

  .text-container {
    padding: 0 40px;
    margin-top: -20px; /* Laat de tekst een beetje over de titels vloeien voor diepte */
  }
</style>
