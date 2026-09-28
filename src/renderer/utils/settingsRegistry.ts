export interface SettingsSection {
  tab: 'general' | 'shortcuts';
  label: string;
  keywords: string;
}

const registry: SettingsSection[] = [];

export function registerSettingsSection(section: SettingsSection) {
  const exists = registry.find(s => s.tab === section.tab && s.label === section.label);
  if (!exists) registry.push(section);
}

export function getKeywordsForTab(tab: SettingsSection['tab']): string {
  return registry
    .filter(s => s.tab === tab)
    .map(s => s.keywords)
    .join(' ');
}
