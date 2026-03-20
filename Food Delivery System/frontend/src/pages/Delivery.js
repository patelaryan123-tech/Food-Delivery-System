import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Delivery.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const Delivery = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState("Preparing your order...");

    useEffect(() => {
        const userLat = parseFloat(localStorage.getItem("lat"));
        const userLng = parseFloat(localStorage.getItem("lng"));

        if (!userLat || !userLng) {
            alert("❌ Location not found. Please checkout again.");
            navigate('/checkout');
            return;
        }

        // Restaurant Location (Ahmedabad)
        const shopLat = 23.0225;
        const shopLng = 72.5714;

        // MAP INIT - Standard Leaflet pattern
        const container = L.DomUtil.get('map');
        if (container != null) {
            container._leaflet_id = null;
        }

        const map = L.map("map").setView([userLat, userLng], 13);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap"
        }).addTo(map);

        // 📍 MARKERS
        const shopMarker = L.marker([shopLat, shopLng]).addTo(map).bindPopup("🏪 Restaurant");
        const userMarker = L.marker([userLat, userLng]).addTo(map).bindPopup("🏠 Your Address");

        const startDeliveryBoyMoving = (path) => {
            let i = 0;
            const boyIcon = L.icon({
                iconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png",
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            });
            
            const boy = L.marker(path[0], { icon: boyIcon }).addTo(map);
            setStatus("🚴 Delivery partner is on the way");

            const moveInterval = setInterval(() => {
                if (i >= path.length) {
                    clearInterval(moveInterval);
                    setStatus("✅ Order Delivered Successfully");
                    setTimeout(() => navigate('/bill'), 2000);
                    return;
                }
                boy.setLatLng(path[i]);
                i++;
            }, 1000);

            return moveInterval;
        };

        // FETCH ROUTE
        fetch(`https://router.project-osrm.org/route/v1/driving/${shopLng},${shopLat};${userLng},${userLat}?overview=full&geometries=geojson`)
            .then(res => {
                if (!res.ok) throw new Error('OSRM API Error');
                return res.json();
            })
            .then(data => {
                if (!data.routes || data.routes.length === 0) throw new Error('No route found');

                const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                const polyline = L.polyline(coords, { color: "#6366f1", weight: 6, opacity: 0.7 }).addTo(map);
                map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
                
                const interval = startDeliveryBoyMoving(coords);
                return () => clearInterval(interval);
            })
            .catch(err => {
                console.error('Route error:', err);
                // FALLBACK: Straight line if API fails
                setStatus("🚴 Delivery partner is on the way (Map limited)");
                const straightPath = [
                    [shopLat, shopLng],
                    [(shopLat + userLat)/2, (shopLng + userLng)/2],
                    [userLat, userLng]
                ];
                const polyline = L.polyline(straightPath, { color: "#6366f1", weight: 6, dashArray: '10, 10' }).addTo(map);
                map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
                
                const interval = startDeliveryBoyMoving(straightPath);
                return () => clearInterval(interval);
            });

        return () => {
            map.remove();
        };
    }, [navigate]);

    return (
        <div className="delivery-body">
            <h2>🚴 Delivery On The Way</h2>
            <div id="map"></div>
            <div id="status">{status}</div>
        </div>
    );
};

export default Delivery;
