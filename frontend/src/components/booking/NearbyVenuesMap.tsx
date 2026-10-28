import React, { useEffect, useRef } from 'react';
import { Map, ExternalLink } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useBookingStore } from '../../store/useBookingStore';

export const NearbyVenuesMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { setSelectedVenueSlug } = useBookingStore();

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Tọa độ trung tâm: Cụm Sân Cầu Lông Cầu Giấy (Trần Thái Tông)
    const centerLat = 21.0313;
    const centerLng = 105.7892;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Sử dụng CartoDB Positron sạch đẹp, tối giản chuẩn mockup
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB &copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    // Ghim 1: Cụm Sân Cầu Giấy (Đang chọn)
    const primaryIcon = L.divIcon({
      className: 'custom-pin-primary',
      html: `
        <div style="background-color: #059669; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); white-space: nowrap; border: 2px solid white;">
          <span>🏸</span> Sân Cầu Giấy (Đang chọn) • 35 Trần Thái Tông
        </div>
      `,
      iconSize: [200, 30],
      iconAnchor: [100, 15],
    });

    L.marker([centerLat, centerLng], { icon: primaryIcon }).addTo(map);

    // Ghim 2: Sân Dịch Vọng (800m • Còn 4 slot)
    const dichVongIcon = L.divIcon({
      className: 'custom-pin-dichvong',
      html: `
        <div style="background: white; border: 1px solid #CBD5E1; border-radius: 12px; padding: 6px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 140px; font-family: sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <b style="font-size: 11px; color: #0F172A;">Sân Dịch Vọng</b>
            <span style="font-size: 10px; color: #D97706; font-weight: bold;">4.7★</span>
          </div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">800m • Còn 4 slot <span style="color: #059669; font-weight: bold;">80k/h</span></div>
          <button id="btn-switch-dv" style="margin-top: 4px; width: 100%; background: #059669; color: white; border: none; border-radius: 6px; padding: 3px; font-size: 9px; font-weight: 600; cursor: pointer;">
            Chuyển sang sân này
          </button>
        </div>
      `,
      iconSize: [140, 60],
      iconAnchor: [70, 30],
    });

    const markerDv = L.marker([21.0345, 105.794], { icon: dichVongIcon }).addTo(map);
    markerDv.on('add', () => {
      const btn = document.getElementById('btn-switch-dv');
      if (btn) {
        btn.onclick = () => setSelectedVenueSlug('san-cau-long-dich-vong');
      }
    });

    // Ghim 3: Sân Yên Hòa (1.2km)
    const yenHoaIcon = L.divIcon({
      className: 'custom-pin-yenhoa',
      html: `
        <div style="background: white; border: 1px solid #E2E8F0; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; color: #334155; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
          ● Sân Yên Hòa • 1.2km (6 slot)
        </div>
      `,
      iconSize: [150, 24],
      iconAnchor: [75, 12],
    });
    L.marker([21.023, 105.792], { icon: yenHoaIcon }).addTo(map);

    // Ghim 4: CLB Nghĩa Tân (1.9km)
    const nghiaTanIcon = L.divIcon({
      className: 'custom-pin-nghiatan',
      html: `
        <div style="background: white; border: 1px solid #E2E8F0; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; color: #334155; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
          ● CLB Nghĩa Tân • 1.9km (2 slot)
        </div>
      `,
      iconSize: [150, 24],
      iconAnchor: [75, 12],
    });
    L.marker([21.043, 105.795], { icon: nghiaTanIcon }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [setSelectedVenueSlug]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs my-4">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <Map className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Bản Đồ Cụm Sân Lân Cận – Hà Nội
          </h2>
          <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700">
            Bán kính 2.5km
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>Cách bạn 2.4 km • 7 phút đi xe</span>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center space-x-0.5"
          >
            <span>Mở Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 h-64 sm:h-72 relative">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Bottom Street Label pill */}
        <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-2xs px-3 py-1 rounded-full pointer-events-none z-10 font-medium">
          Đường Duy Tân • Trần Thái Tông
        </div>
      </div>
    </div>
  );
};
