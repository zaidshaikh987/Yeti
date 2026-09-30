import React, { useEffect, useState } from 'react';
import { db } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Tag, FileText, Loader2 } from 'lucide-react';

export default function Explore() {
  const [data, setData] = useState({
    expeditions: [],
    stations: [],
    themes: [],
    assets: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [expRes, stnRes, thmRes, astRes] = await Promise.all([
          db.entities.Expedition.filter({}, { limit: 10 }),
          db.entities.Station.filter({}, { limit: 10 }),
          db.entities.ResearchTheme.filter({}, { limit: 10 }),
          db.entities.Asset.filter({ review_status: "approved" }, { limit: 10 })
        ]);
        
        setData({
          expeditions: expRes.items || [],
          stations: stnRes.items || [],
          themes: thmRes.items || [],
          assets: astRes.items || []
        });
      } catch (err) {
        console.error("Error fetching explore data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4DA8D8]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-[1200px]">
      <h1 className="text-3xl font-bold text-[#071A2B] mb-2">Explore the Repository</h1>
      <p className="text-muted-foreground mb-8">Discover expeditions, research stations, themes, and assets.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Expeditions */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-[#4DA8D8]">
            <Compass className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-[#071A2B]">Expeditions</h2>
          </div>
          <div className="space-y-3">
            {data.expeditions.length === 0 ? <p className="text-sm text-muted-foreground">No expeditions found.</p> : null}
            {data.expeditions.map(exp => (
              <div key={exp.id} className="border border-border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-md">{exp.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{exp.description}</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] uppercase tracking-wider bg-secondary px-2 py-1 rounded">{exp.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stations */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-[#0B2942]">
            <MapPin className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-[#071A2B]">Stations</h2>
          </div>
          <div className="space-y-3">
            {data.stations.length === 0 ? <p className="text-sm text-muted-foreground">No stations found.</p> : null}
            {data.stations.map(stn => (
              <div key={stn.id} className="border border-border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-md">{stn.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{stn.location} • Est. {stn.established_year}</p>
                <p className="text-xs text-muted-foreground mt-2">{stn.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Research Themes */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-[#F4A340]">
            <Tag className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-[#071A2B]">Research Themes</h2>
          </div>
          <div className="space-y-3">
            {data.themes.length === 0 ? <p className="text-sm text-muted-foreground">No themes found.</p> : null}
            {data.themes.map(thm => (
              <div key={thm.id} className="border border-border rounded-lg p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-md">{thm.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{thm.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assets */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-[#8B5CF6]">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-[#071A2B]">Latest Assets</h2>
          </div>
          <div className="space-y-3">
            {data.assets.length === 0 ? <p className="text-sm text-muted-foreground">No assets found.</p> : null}
            {data.assets.map(asset => (
              <Link key={asset.id} to={`/asset/${asset.id}`} className="block border border-border rounded-lg p-4 bg-white shadow-sm hover:border-[#4DA8D8] transition-colors">
                <h3 className="font-semibold text-md">{asset.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{asset.region} • {asset.year}</p>
                <div className="mt-3 flex gap-2">
                  <span className="text-[10px] uppercase tracking-wider bg-secondary px-2 py-1 rounded">{asset.content_type}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Link to="/knowledge-graph" className="inline-flex items-center gap-2 bg-[#4DA8D8] hover:bg-[#3D94C3] text-white px-6 py-3 rounded-lg font-medium transition-colors">
          View Knowledge Graph
        </Link>
      </div>
    </div>
  );
}
