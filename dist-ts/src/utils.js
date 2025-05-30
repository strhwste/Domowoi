export function filterSensorsByArea(states, areaId) {
    // Vergleiche areaId und st.attributes.area_id getrimmt und in Kleinbuchstaben
    const norm = (v) => (v || '').toLowerCase().trim();
    return states.filter(st => norm(st.attributes?.area_id) === norm(areaId));
}
