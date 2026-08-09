"use client";

import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import PropertyCard from "./PropertyCard";

export default function HeroMap3D() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [showOverlays, setShowOverlays] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // We use a free, tokenless raster basemap via MapLibre
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "osm": {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap Contributors",
          }
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [84.124, 28.3949], // Centered over Nepal
      zoom: 5.5,
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Realistic dummy parcel polygon in Amarsingh Chowk
      const parcelCoordinates = [
        [83.9962, 28.2042],
        [83.9972, 28.2040],
        [83.9975, 28.2046],
        [83.9964, 28.2048],
        [83.9962, 28.2042]
      ];

      // Add cadastral polygon source
      map.addSource("cadastral-parcel", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [parcelCoordinates]
          },
          properties: {
            area: "1 Ropani 2 Aana"
          }
        }
      });

      // Add survey points (corners)
      map.addSource("survey-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: parcelCoordinates.slice(0, 4).map((coord, i) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: coord },
            properties: { id: `P${i + 1}`, coord: `${coord[1].toFixed(4)}°N, ${coord[0].toFixed(4)}°E` }
          }))
        }
      });

      // Add boundary lines with dimension properties
      const lineFeatures = [];
      const dimensions = ["112 ft", "96 ft", "108 ft", "62 ft (Frontage)"];
      for (let i = 0; i < 4; i++) {
        const start = parcelCoordinates[i];
        const end = parcelCoordinates[i + 1];
        const midPoint = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2
        ];
        
        lineFeatures.push({
          type: "Feature" as const,
          geometry: { type: "Point" as const, coordinates: midPoint },
          properties: { dimension: dimensions[i] }
        });
      }

      map.addSource("boundary-dimensions", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: lineFeatures
        }
      });

      // Start the animation sequence
      setTimeout(() => {
        // Phase 1: Fly to Pokhara
        map.flyTo({
          center: [83.9856, 28.2096],
          zoom: 11,
          speed: 0.8,
          curve: 1.2,
          easing(t) { return t; }
        });

        // Phase 2: Dive into Amarsingh Chowk
        setTimeout(() => {
          map.flyTo({
            center: [83.9968, 28.2044],
            zoom: 17.8,
            pitch: 62,
            bearing: -35,
            speed: 0.5,
            curve: 1.5,
            easing(t) { return t; }
          });
        }, 4500);

        // Phase 3: Trigger Overlays once map settles
        let flyToFinished = false;
        map.on('moveend', () => {
          if (!flyToFinished && map.getZoom() > 17) {
            flyToFinished = true;
            setTimeout(() => setShowOverlays(true), 600);
          }
        });

      }, 1000);
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (showOverlays && mapRef.current) {
      const map = mapRef.current;
      
      if (map.getLayer("cadastral-fill")) return; // prevent duplicate adding

      // Render the glowing polygon
      map.addLayer({
        id: "cadastral-fill",
        type: "fill",
        source: "cadastral-parcel",
        paint: {
          "fill-color": "#4ade80",
          "fill-opacity": 0.25,
        }
      });

      map.addLayer({
        id: "cadastral-line",
        type: "line",
        source: "cadastral-parcel",
        paint: {
          "line-color": "#4ade80",
          "line-width": 3,
          "line-dasharray": [2, 1]
        }
      });

      // Polygon Area Label
      map.addLayer({
        id: "cadastral-area-label",
        type: "symbol",
        source: "cadastral-parcel",
        layout: {
          "text-field": ["get", "area"],
          "text-font": ["sans-serif"],
          "text-size": 18,
          "text-letter-spacing": 0.1
        },
        paint: {
          "text-color": "#4ade80",
          "text-halo-color": "rgba(0,0,0,0.8)",
          "text-halo-width": 3
        }
      });

      // Boundary Dimensions
      map.addLayer({
        id: "boundary-dimensions-label",
        type: "symbol",
        source: "boundary-dimensions",
        layout: {
          "text-field": ["get", "dimension"],
          "text-font": ["sans-serif"],
          "text-size": 13,
          "text-offset": [0, 0]
        },
        paint: {
          "text-color": "#facc15",
          "text-halo-color": "rgba(0,0,0,0.85)",
          "text-halo-width": 2
        }
      });

      // Render the survey corner points
      map.addLayer({
        id: "survey-points-circle",
        type: "circle",
        source: "survey-points",
        paint: {
          "circle-radius": 7,
          "circle-color": "#ef4444",
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff"
        }
      });

      // Add labels for survey points and coordinates
      map.addLayer({
        id: "survey-points-label",
        type: "symbol",
        source: "survey-points",
        layout: {
          "text-field": ["format", ["get", "id"], { "font-scale": 1.2 }, "\n", ["get", "coord"], { "font-scale": 0.7 }],
          "text-font": ["sans-serif"],
          "text-size": 13,
          "text-offset": [0, 1.2],
          "text-anchor": "top"
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "rgba(0,0,0,0.8)",
          "text-halo-width": 2
        }
      });
    }
  }, [showOverlays]);

  return (
    <div className="absolute inset-0 w-full h-full bg-neutral-950">
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ filter: "saturate(1.2) contrast(1.05) brightness(0.95)" }} />
      
      {/* 3D Cinematic vignette and color grading */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.15)",
        pointerEvents: "none"
      }} />
      
      <div className="absolute inset-0 pointer-events-none bg-emerald-950/10 mix-blend-color" />
      
      {/* ═══════════════════════════════════════════════════════════
          PREMIUM GIS PROPERTY PANEL (RIGHT SIDE)
      ═══════════════════════════════════════════════════════════ */}
      {showOverlays && <PropertyCard />}

    </div>
  );
}
