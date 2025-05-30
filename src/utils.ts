export function filterSensorsByArea(states: any[], areaId: string) {
  // Vergleiche areaId und st.attributes.area_id getrimmt und in Kleinbuchstaben
  const norm = (v: string) => (v || '').toLowerCase().trim();
  return states.filter(st => norm(st.attributes?.area_id) === norm(areaId));
}