export interface MeshPalette {
  name: string;
  colors: string[];
  category: 'disney' | 'marvel' | 'hollywood';
}

export const curatedMeshPalettes = [
  { name: 'Sunset', colors: ['#ff5f6d', '#ffc371', '#ff7e5f', '#feb47b'] },
  { name: 'Ocean', colors: ['#00c6ff', '#0072ff', '#0a2540', '#00d2ff'] },
  { name: 'Neon', colors: ['#f72585', '#7209b7', '#3f37c9', '#4cc9f0'] },
  { name: 'Forest', colors: ['#11998e', '#38ef7d', '#134e5e', '#71b280'] },
  { name: 'Aurora', colors: ['#0575e6', '#00f260', '#0f2027', '#203a43'] }
];

export const disneyHollywoodMeshPalettes: MeshPalette[] = [
  // FANTASY & ANIMATION MESH PALETTES
  {
    name: 'Playtime Toys',
    colors: ['#38bdf8', '#facc15', '#ef4444', '#84cc16'],
    category: 'disney'
  },
  {
    name: 'Fjord Ice Castle',
    colors: ['#e0f2fe', '#7dd3fc', '#0284c7', '#a855f7'],
    category: 'disney'
  },
  {
    name: 'Savannah Dusk',
    colors: ['#7c2d12', '#ea580c', '#facc15', '#b45309'],
    category: 'disney'
  },
  {
    name: 'Desert Wonders',
    colors: ['#3b0764', '#0d9488', '#0ea5e9', '#ca8a04'],
    category: 'disney'
  },
  {
    name: 'Ocean Reef Lagoon',
    colors: ['#0f766e', '#06b6d4', '#f43f5e', '#ec4899'],
    category: 'disney'
  },
  {
    name: 'Golden Flower Lanterns',
    colors: ['#2e1065', '#6b21a8', '#c084fc', '#facc15'],
    category: 'disney'
  },
  {
    name: 'Memories Marigold',
    colors: ['#db2777', '#7c3aed', '#ea580c', '#eab308'],
    category: 'disney'
  },
  {
    name: 'Monstrous Teal',
    colors: ['#0891b2', '#7c3aed', '#a3e635', '#4d7c0f'],
    category: 'disney'
  },
  
  // HEROIC COMICS MESH PALETTES
  {
    name: 'Reactor Core',
    colors: ['#b91c1c', '#ea580c', '#eab308', '#1e293b'],
    category: 'marvel'
  },
  {
    name: 'Vibranium Purple',
    colors: ['#1e0030', '#5d0c8c', '#ca8a04', '#0f172a'],
    category: 'marvel'
  },
  {
    name: 'Multiverse Neon',
    colors: ['#ff007f', '#00f5d4', '#7b2cbf', '#f15bb5'],
    category: 'marvel'
  },
  {
    name: 'Thunder Storm',
    colors: ['#0284c7', '#eab308', '#ef4444', '#475569'],
    category: 'marvel'
  },

  // CINEMATIC MESH PALETTES
  {
    name: 'Bubblegum Dollhouse',
    colors: ['#ff758c', '#ff7eb3', '#fecfef', '#a5f3fc'],
    category: 'hollywood'
  },
  {
    name: 'Cinema Glamour',
    colors: ['#b91c1c', '#fdf0cd', '#c5a059', '#111111'],
    category: 'hollywood'
  },
  {
    name: 'Galactic Saber',
    colors: ['#030712', '#1d4ed8', '#06b6d4', '#ec4899'],
    category: 'hollywood'
  }
];
