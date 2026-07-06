<script lang="ts">
  import { fade } from 'svelte/transition';
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
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    transition:fade={{ duration: 200 }}
  >
    <div class="top-row">
      <button class="close-btn" onclick={onClose}> ✕ (close) </button>
    </div>

    <div class="content">
      <!-- Tekstzijde -->
      <div class="text-side">
        <div class="text-content-wrapper">
          {#if project.info}
            <span class="info">({project.info})</span>
          {/if}
          <h2 id="modal-title">{project.title}</h2>

          {#if project.description}
            <p class="description">{project.description}</p>
          {/if}

          {#if project.link}
            <a class="link" href={project.link} target="_blank" rel="noopener noreferrer">
              View project <span class="arrow">→</span>
            </a>
          {/if}
        </div>
      </div>

      <!-- Afbeeldingszijde (Perfect uitgelijnd op de grid-lijnen) -->
      <div class="image-side">
        <div class="image-container">
          <img src={project.img} alt={project.title} />
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* --- Globale Schaduw Reset --- */
  .modal,
  .modal :global(*) {
    text-shadow: none !important;
  }

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(20, 18, 14, 0.4);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .backdrop-close {
    position: absolute;
    inset: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }

  /* Desktop basis */
  .modal {
    position: relative;
    z-index: 1;
    width: 100vw;
    height: 60vh;
    background: #f6f5f2;
    color: #14120e;
    display: flex;
    flex-direction: column;
    border-top: 0.5px solid rgba(20, 18, 14, 0.15);
    border-bottom: 0.5px solid rgba(20, 18, 14, 0.15);
    overflow: hidden;
  }

  .top-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 24px 64px;
    border-bottom: 0.5px solid rgba(20, 18, 14, 0.15);
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .close-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: #14120e;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  .close-btn:hover {
    opacity: 1;
  }

  .content {
    display: flex;
    align-items: stretch;
    flex: 1;
    min-height: 0;
    width: 100%;
  }

  /* Exact 50% / 50% verdeling voor perfecte alignment */
  .text-side {
    flex: 1;
    padding: 64px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* Tekst start strak bovenaan */
    align-items: flex-start;
    overflow: hidden;
  }

  .text-content-wrapper {
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Afbeeldingspaneel */
  .image-side {
    flex: 1;
    display: flex;
    align-items: flex-start; /* Uitgelijnd met de top van de tekstkolom */
    justify-content: center;
    padding: 64px;
    border-left: 0.5px solid rgba(20, 18, 14, 0.15);
  }

  /* Container die de verhoudingen bewaakt */
  .image-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .image-side img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Typografie */
  .info {
    font-size: 11px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    opacity: 0.45;
  }

  h2 {
    margin: 0;
    font-size: 38px;
    line-height: 1.1;
    font-weight: 400;
    letter-spacing: -0.5px;
  }

  .description {
    line-height: 1.6;
    font-size: 15px;
    margin: 0;
    opacity: 0.7;
  }

  .link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #14120e;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    text-decoration: none;
    border-bottom: 0.5px solid currentColor;
    width: fit-content;
    padding-bottom: 4px;
    opacity: 0.8;
    transition: opacity 0.15s ease;
    margin-top: 8px;
  }

  .arrow {
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .link:hover .arrow {
    transform: translateX(4px);
  }

  /* --- MOBIELE OPTIMALISATIE (GEEN SCROLLBARS) --- */
  @media (max-width: 900px) {
    .backdrop {
      padding: 16px;
    }

    .modal {
      width: 100%;
      height: auto;
      max-height: 80vh; /* Strikte limiet om over de viewport heen te klappen */
      border: 0.5px solid rgba(20, 18, 14, 0.15);
      overflow: hidden; /* Voorkomt de noodzaak voor een scrollbar */
    }

    .top-row {
      padding: 16px 20px;
    }

    .content {
      flex-direction: column;
      height: calc(100% - 49px); /* Haalt exact de hoogte van de top-row eraf */
    }

    /* Image nu verplicht BOVEN */
    .image-side {
      order: -1;
      height: 28vh; /* Vaste compacte hoogte */
      padding: 16px;
      border-left: none;
      border-bottom: 0.5px solid rgba(20, 18, 14, 0.15);
      align-items: center; /* Op mobiel centreren we de afbeelding in zijn vak */
    }

    .image-container {
      height: 100%;
    }

    /* Tekstzijde op mobiel sluit hier direct op aan */
    .text-side {
      padding: 20px;
      gap: 12px;
    }

    .text-content-wrapper {
      max-width: 100%;
      gap: 12px;
    }

    h2 {
      font-size: 24px;
    }

    .description {
      font-size: 14px;
      line-height: 1.5;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .arrow {
      transition: none;
    }
  }
</style>
