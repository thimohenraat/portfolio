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
    width: 100%;
    padding-top: 80px;
  }

  .text-container {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-left: 80px;
  }

  @media (max-width: 768px) {
    #about {
      display: flex; /* Gebruik flex voor betere controle op mobile */
      flex-direction: column;
      justify-content: center; /* Dit centreert de text-container verticaal op het scherm */
      align-items: center; /* Dit centreert horizontaal */
      min-height: 100svh; /* Gebruik svh voor mobiele browsers (vult het scherm) */
      position: relative;
      padding: 60px 20px;
      text-align: center;
    }

    .title-container {
      /* Haal hem uit de flow zodat de tekst-container het midden van het scherm kan bepalen */
      position: absolute;
      top: 120px; /* Iets minder dan 80px voor mobiele balans */
      left: 0;
      right: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      z-index: 2;
    }

    .text-container {
      padding: 0;
      width: 100%;
      justify-content: center; /* Horizontaal midden */
      align-items: center; /* Verticaal midden binnen flex */
      /* Geen height 100% nodig, #about zorgt voor de centrering */
    }
  }
</style>
