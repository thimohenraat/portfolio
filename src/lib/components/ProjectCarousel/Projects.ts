import type { Project } from '$lib/types/project';

export const defaultProjects: Project[] = [
  {
    title: 'Wooncoöperatie De Bonte hulst',
    info: 'Website - Design',
    img: '/images/DeBontehulst.webp',
    description:
      'Een website ontworpen, ontwikkeld en onderhouden in een CMS, voor wooncoöperatie De Bonte Hulst. De website weerspiegelt de duurzame visie van de coöperatie en functioneert als het centrale portaal voor ledenwerving en externe communicatie.',
    link: 'https://www.debontehulst.nl/',
  },
  {
    title: 'Sprint analysator',
    info: 'App - Sensor - Flutter',
    img: '/images/SprintApp.webp',
    description:
      'Dit project richt zich op het visualiseren en analyseren van sprintsessies door middel van sensordata. Dit is ontwikkeld in Flutter. Er is een responsieve en adaptieve interface ontworpen die beschikt over een home screen, een resultatenoverzicht en een dashboard met statistieken en grafieken.',
    link: 'https://github.com/thimohenraat/project',
  },
  {
    title: 'Rijkswaterstaat zoek app',
    info: 'Python - Svelte - Gebruikergericht',
    img: '/images/ZoekApp.webp',
    description:
      'Dit is een afstudeerproject uitgevoerd in opdracht van Rijkswaterstaat. Gericht op het verbeteren van de vindbaarheid van technische documentatie. Middels een gebruikersgerichte aanpak (Design Thinking en Scrum) en na onderzoek naar eindgebruikers en zoekstrategieën, is er een functioneel prototype ontwikkeld van een desktop-zoekapplicatie. Deze applicatie is gebouwd met Python (Flask en Whoosh) en een frontend van HTML, CSS en JavaScript, waarmee medewerkers door middel van indexering en filters snel en betrouwbaar de juiste informatie binnen (grote) bestanden kunnen vinden.',
    link: 'https://github.com/thimohenraat/OSK',
  },
];
