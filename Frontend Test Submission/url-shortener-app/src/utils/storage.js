const STORAGE_KEY = 'url-shortener-mappings';

export function loadMappings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { links: [] };
  } catch (error) {
    console.error('Error loading mappings:', error);
    return { links: [] };
  }
}

export function saveMappings(mappings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Error saving mappings:', error);
  }
}