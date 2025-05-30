export function filterSensorsByArea(states: any[], areaId: string) {
  // Return all entities for the area, not just those with specific device_class
  return states.filter(st => st.attributes.area_id === areaId);
}