export function filterSensorsByArea(states: any[] | undefined | null, areaId: string) {
  // Early return if states is not an array
  if (!Array.isArray(states)) {
    console.warn('[filterSensorsByArea] States is not an array:', states);
    return [];
  }

  // Vergleiche areaId und st.attributes.area_id getrimmt und in Kleinbuchstaben
  const norm = (v: string) => (v || '').toLowerCase().trim();
  
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