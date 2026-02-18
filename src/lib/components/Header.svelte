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
    font-size: 2rem;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: -1px;
  }

  .last-name {
    margin-left: 20px;
    font-weight: 400;
  }
</style>
