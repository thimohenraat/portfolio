<script>
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];
</script>

<header>
  <nav class="navbar">
    <ul class="nav-links">
      {#each navItems as item}
        <li><a href={item.href}>{item.label}</a></li>
      {/each}
    </ul>
  </nav>
  <h1 class="title">Thimo Henraat</h1>
</header>

<style>
</style>
