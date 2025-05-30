export function filterSensorsByArea(states, areaId) {
    return states.filter(st => st.attributes.area_id === areaId &&
        ['humidity', 'co2', 'temperature'].includes(st.attributes.device_class));
}
