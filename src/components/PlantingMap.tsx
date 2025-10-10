import { useEffect, useMemo, useRef } from "react";
import L, { LatLngBoundsExpression, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issues (Vite bundling)
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface PlantingLocation {
  id: string;
  tree_name: string;
  latitude: number;
  longitude: number;
  planting_date: string;
  status: string;
}

interface PlantingMapProps {
  locations: PlantingLocation[];
}

// Pure Leaflet implementation to avoid react-leaflet context issues
export const PlantingMap = ({ locations }: PlantingMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const center = useMemo(() => {
    if (!locations.length) return { lat: -0.0236, lng: 37.9062 }; // Kenya approx
    const lat = locations.reduce((s, l) => s + l.latitude, 0) / locations.length;
    const lng = locations.reduce((s, l) => s + l.longitude, 0) / locations.length;
    return { lat, lng };
  }, [locations]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    // Update markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      const bounds: LatLngBoundsExpression = [] as unknown as LatLngBoundsExpression;
      const latlngs: L.LatLngExpression[] = [];

      locations.forEach((loc) => {
        const latlng: L.LatLngExpression = [loc.latitude, loc.longitude];
        latlngs.push(latlng);
        L.marker(latlng).bindPopup(
          `<div style="padding:4px;">
            <strong>${loc.tree_name}</strong><br/>
            <span style="font-size:12px;color:#6b7280;">Planted: ${new Date(
              loc.planting_date
            ).toLocaleDateString()}</span>
           </div>`
        ).addTo(markersLayerRef.current!);
      });

      if (latlngs.length && mapRef.current) {
        const leafletBounds = L.latLngBounds(latlngs);
        mapRef.current.fitBounds(leafletBounds, { padding: [20, 20] });
      }
    }

    // Cleanup on unmount
    return () => {
      // Do not remove map to keep it for navigation back; let React unmount handle it
    };
  }, [center.lat, center.lng, locations]);

  if (!locations.length) return null;

  return <div ref={containerRef} className="w-full h-full" role="region" aria-label="Planting locations map" />;
};
