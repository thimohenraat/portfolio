<div class="titles-wrapper">
  <h2 class="title-top">Interactie Technoloog</h2>
  <h2 class="title-and">&</h2>
  <h2 class="title-bottom">Frontend Developer</h2>
</div>

<style>
  .titles-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1.2; /* Iets meer ademruimte voor elegantie */
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.75rem, 3vw, 5rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    white-space: nowrap;
  }

  .title-top {
    /* align-self: flex-end; */
  }

  .title-and {
    font-style: italic;
    font-weight: 400;
    margin: 0.2rem 0;
  }

  .title-bottom {
    /* align-self: flex-start; */
  }

  @media (max-width: 768px) {
    h2 {
      white-space: normal;
      text-align: center;
    }
  }
</style>
