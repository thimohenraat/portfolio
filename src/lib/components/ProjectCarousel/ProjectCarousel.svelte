<script lang="ts">
  import ProjectModal from './ProjectModal.svelte';
  import type { Project } from '$lib/types/project';
  import { defaultProjects } from './Projects.ts';

  let { projects = defaultProjects }: { projects?: Project[] } = $props();

  // We verdubbelen de lijst voor de naadloze loop
  const REPEATS = 6;
  const displayProjects = $derived(Array(REPEATS).fill(projects).flat());

  let selectedProject = $state<Project | null>(null);

  const openProject = (project: Project) => {
    selectedProject = project;
  };

  const closeProject = () => {
    selectedProject = null;
  };
</script>

<section class="carousel-wrapper">
  <div class="scroll-container">
    <div class="carousel-track">
      {#each displayProjects as project, i}
        <button
          type="button"
          class="carousel-item {i % 2 === 0 ? 'is-low' : 'is-high'}"
          onclick={() => openProject(project)}
        >
          <div class="text-content">
            <span class="info">{project.info}</span>
            <h3>{project.title}</h3>
          </div>

          <div class="image-wrapper">
            <img src={project.img} alt={project.title} loading="lazy" />
          </div>
        </button>
      {/each}
    </div>
  </div>
</section>

{#if selectedProject}
  <ProjectModal project={selectedProject} onClose={closeProject} />
{/if}

<style>
  .carousel-wrapper {
    position: fixed;
    bottom: 20px;
    left: 0;
    width: 100%;
    z-index: 10;
    pointer-events: none;
  }

  .scroll-container {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    pointer-events: auto;
    scrollbar-width: none;
  }

  .scroll-container::-webkit-scrollbar {
    display: none;
  }

  .carousel-track {
    display: flex;
    width: max-content;
    height: 100%;
    gap: 60px;
    padding: 0 40px;
    align-items: flex-end;
    animation: scroll 240s linear infinite;
  }

  .carousel-track:hover {
    animation-play-state: paused;
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-66.6666666%);
    }
  }

  .carousel-item {
    width: 280px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-align: left;
    font: inherit;
    color: inherit;
  }

  /* --- Wiskundige Posities --- */
  .text-content {
    text-shadow:
      -1px -1px 0 #fcfeff,
      1px -1px 0 #fcfeff,
      -1px 1px 0 #fcfeff,
      1px 1px 0 #fcfeff,
      -2px 0 0 #fcfeff,
      2px 0 0 #fcfeff,
      0 -2px 0 #fcfeff,
      0 2px 0 #fcfeff;
  }

  /* EVEN ITEMS: Laag, tekst boven */
  .is-low {
    margin-bottom: 0;
  }
  .is-low .text-content {
    margin-bottom: 12px;
  }

  /* ONEVEN ITEMS: Hoog, tekst onder */
  .is-high {
    flex-direction: column-reverse;
  }
  .is-high .text-content {
    margin-top: 12px;
  }

  .image-wrapper {
    width: 100%;
    height: 160px;
    background: #111;
    overflow: hidden;
    border-radius: 2px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(1);
    transition:
      filter 0.5s,
      transform 0.5s ease;
  }

  .carousel-item:hover img {
    filter: grayscale(0);
    /* transform: scale(1.08); */
  }

  .info {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #888;
  }

  h3 {
    font-size: 15px;
    margin: 0;
    font-weight: 400;
  }

  /* --- Mobiele Aanpassingen --- */
  @media (max-width: 768px) {
    .carousel-track {
      gap: 30px;
      padding: 0 20px;
    }

    .carousel-item {
      width: 200px;
    }

    .image-wrapper {
      height: 114px;
    }

    h3 {
      font-size: 13px;
    }

    .info {
      font-size: 8px;
    }
  }
</style>
