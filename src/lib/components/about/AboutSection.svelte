<script>
  import BigTitles from './AboutTitles.svelte';
  import AboutText from './AboutText.svelte';
</script>

<section id="about">
  <div class="title-container">
    <BigTitles />
  </div>
  <div class="text-container">
    <AboutText />
  </div>
</section>

<style>
  #about {
    width: 100%;
    display: grid;
    grid-template-columns: 45% 55%;
    padding: 100px 40px;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .title-container {
    /* De titels vullen de 40% kolom */
    width: 100%;
    padding-top: 80px;
  }

  .text-container {
    /* De tekst vult de 60% kolom */
    display: flex;
    justify-content: flex-end; /* Duwt de tekst naar de rechterkant */
    padding-left: 80px;
  }

  /* Responsive: op mobiel alles onder elkaar */
  @media (max-width: 900px) {
    #about {
      grid-template-columns: 1fr;
      gap: 40px;
      padding: 60px 20px;
    }

    .text-container {
      padding-left: 0;
      justify-content: flex-start;
    }
  }
</style>
