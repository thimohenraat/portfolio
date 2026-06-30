import type { Project } from '$lib/types/project';

export const defaultProjects: Project[] = [
  {
    title: 'Wooncoöperatie De Bonte hulst',
    info: 'Website - Design',
    img: '/images/DeBontehulst.webp',
    description:
      'Een website die ik heb ontworpen, ontwikkeld en onderhoudt in een CMS voor wooncoöperatie De Bonte Hulst.',
  },
  {
    title: 'Sprint analysator',
    info: 'App - Sensor - Flutter',
    img: '/images/SprintApp.webp',
    description:
      'Dit project richt zich op het visualiseren en analyseren van hardloopprestaties door middel van opgeslagen sensordata, waarbij gebruik is gemaakt van Flutter. Er is een responsieve en adaptieve interface ontworpen die beschikt over een home screen, een resultatenoverzicht en een dashboard met statistieken en grafieken.',
  },
  {
    title: 'Rijkswaterstaat zoek app',
    info: 'Python - Svelte - Gebruikergericht',
    img: '/images/ZoekApp.webp',
    description:
      'Dit is een afstudeerproject uitgevoerd in opdracht van Rijkswaterstaat (afdeling NOVA DOK). Gericht op het verbeteren van de vindbaarheid van technische documentatie over de Oosterscheldekering. Middels een gebruikersgerichte aanpak (Design Thinking en Scrum) en na onderzoek naar eindgebruikers en zoekstrategieën, is er een functioneel prototype ontwikkeld van een desktop-zoekapplicatie. Deze applicatie is gebouwd met Python (Flask en Whoosh) en een frontend van HTML, CSS en JavaScript, waarmee medewerkers door middel van indexering, filters en datumsortering snel en betrouwbaar de juiste informatie binnen (grote) bestanden kunnen traceren.',
  },
];
