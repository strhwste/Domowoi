export function filterSensorsByArea(states, areaId) {
    // Vergleiche areaId und st.attributes.area_id getrimmt und in Kleinbuchstaben
    const norm = (v) => (v || '').toLowerCase().trim();
    // Debug logging to check area_id matching
    console.log(`[filterSensorsByArea] Looking for area: '${areaId}'`);
    // First find any matching sensors
    const filtered = states.filter(st => {
        const stArea = norm(st.attributes?.area_id);
        const searchArea = norm(areaId);
        // Log each potential match attempt
        if (st.entity_id && st.attributes?.area_id) {
            console.log(`[filterSensorsByArea] Checking entity ${st.entity_id} with area '${st.attributes.area_id}' (normalized: '${stArea}') against '${searchArea}'`);
        }
        return stArea === searchArea;
    });
    // Log what we found
    console.log(`[filterSensorsByArea] Found ${filtered.length} sensors for area '${areaId}':`);
    filtered.forEach(s => console.log(`- ${s.entity_id}`));
    return filtered;
}
//# sourceMappingURL=utils.js.map