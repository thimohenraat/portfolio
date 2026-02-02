<script>
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];
</script>

<header class="header-container">
  <div class="name-wrapper">
    <h1 class="first-name">Thimo</h1>
    <h1 class="last-name">Henraat</h1>
  </div>
</header>

<style>
  .header-container {
    position: fixed;
    top: 20px; /* Afstand van de bovenkant */
    left: 20px; /* Afstand van de linkerkant */
    z-index: 100;
  }

  .name-wrapper {
    display: flex;
    flex-direction: column;
    line-height: 0.8; /* Zorgt dat de regels dichter op elkaar staan voor een modernere look */
  }

  h1 {
    margin: 0;
    font-family: sans-serif; /* Of je eigen gekozen font */
    font-size: 2rem;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: -1px;
  }

  .last-name {
    /* De 'H' van Henraat moet onder de 'h' van Thimo. 
       Omdat 'Thimo' 5 letters heeft en 'Henraat' 7, 
       moeten we Henraat iets compenseren voor de perfecte 'H' alignment. */
    margin-left: 1.4rem;
    font-weight: 400;
  }
</style>
