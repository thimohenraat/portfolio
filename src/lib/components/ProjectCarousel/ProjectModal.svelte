<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { Project } from '$lib/types/project';

  let { project, onClose }: { project: Project; onClose: () => void } = $props();

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
</script>

<svelte:window on:keydown={onKeydown} />

<div class="backdrop" transition:fade={{ duration: 150 }}>
  <button class="backdrop-close" onclick={onClose} aria-label="Sluit modal"></button>

  <div
    class="modal"
    transition:fly={{ y: 15, duration: 250 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <button class="close-btn" onclick={onClose} aria-label="Sluiten">✕</button>

    <div class="content">
      <!-- Links: Tekstzijde (Geen scroll, titel boven, beschrijving gecentreerd) -->
      <div class="text-side">
        <div class="header-group">
          {#if project.info}
            <span class="info">{project.info}</span>
          {/if}
          <h2 id="modal-title">{project.title}</h2>
        </div>

        <div class="center-group">
          {#if project.description}
            <p class="description">{project.description}</p>
          {/if}
        </div>

        <div class="footer-group">
          {#if project.link}
            <a class="link" href={project.link} target="_blank" rel="noopener noreferrer">
              Bekijk project <span class="arrow">→</span>
            </a>
          {/if}
        </div>
      </div>

      <!-- Rechts: Grote afbeelding die maximaal en volledig getoond wordt -->
      <div class="image-side">
        <img src={project.img} alt={project.title} />
      </div>
    </div>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 32px;
  }

  .backdrop-close {
    position: absolute;
    inset: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  .modal {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 1040px; /* Iets breder voor een nog weidser effect */
    height: 65vh;
    background: #ffffff;
    border-radius: 28px 12px 28px 12px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.18);
    overflow: hidden; /* Garandeert dat er absoluut geen scrollbars ontstaan */
  }

  .close-btn {
    position: absolute;
    top: 24px;
    left: 24px;
    border: none;
    background: #ffffff;
    color: #000000;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition:
      transform 0.2s ease,
      background-color 0.2s;
  }

  .close-btn:hover {
    transform: scale(1.05);
    background: #f0f2f3;
  }

  .content {
    display: flex;
    align-items: stretch;
    height: 100%;
  }

  .text-side {
    flex: 1;
    padding: 72px 48px 48px 48px; /* Extra top-padding geeft de titel ademruimte naast de sluitknop */
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* Verdeelt top, center en bottom groepen */
    overflow: hidden; /* Blokkeert scrollen */
  }

  .header-group {
    width: 100%;
  }

  /* Duwt zichzelf naar het exacte verticale midden van de text-side */
  .center-group {
    margin: auto 0;
    width: 100%;
  }

  .footer-group {
    width: 100%;
  }

  .image-side {
    flex: 1.2; /* Geeft nog meer prioriteit en ruimte aan de afbeelding */
    height: 100%;
    background: #fcfdfe; /* Zachte off-white achtergrond vult eventuele lege randen van de contain op */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-side img {
    width: 100%;
    height: 100%;
    /* 'contain' zorgt ervoor dat de liggende rechthoek ALTIJD 100% volledig zichtbaar is */
    object-fit: contain;
    display: block;
    padding: 16px; /* Subtiele padding zodat de foto prachtig zweeft binnen het witte vlak */
  }

  .info {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #777;
    font-weight: 600;
    margin-bottom: 8px;
    display: block;
  }

  h2 {
    margin: 0;
    font-size: 28px;
    line-height: 1.2;
    font-weight: 800;
    color: #000;
    letter-spacing: -0.5px;
  }

  .description {
    color: #444;
    line-height: 1.65;
    font-size: 14px;
    margin: 0;
  }

  .link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #000;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    border-bottom: 2px solid #000;
    width: fit-content;
    padding-bottom: 2px;
  }

  .link:hover {
    opacity: 0.6;
  }

  .arrow {
    transition: transform 0.2s ease;
  }

  .link:hover .arrow {
    transform: translateX(3px);
  }

  /* Responsive styling voor mobiele schermen */
  @media (max-width: 768px) {
    .backdrop {
      padding: 16px;
    }

    .modal {
      height: auto;
      max-height: 90vh;
      border-radius: 20px;
    }

    .content {
      flex-direction: column;
      height: auto;
    }

    .image-side {
      width: 100%;
      height: 30vh;
      order: -1;
    }

    .image-side img {
      padding: 8px;
    }

    .text-side {
      width: 100%;
      padding: 32px 24px;
      gap: 20px;
    }

    .center-group {
      margin: 0; /* Schakelt zware centrering uit op mobiel voor natuurlijke flow */
    }

    .close-btn {
      top: 12px;
      left: 12px;
    }

    h2 {
      font-size: 22px;
    }
  }
</style>
