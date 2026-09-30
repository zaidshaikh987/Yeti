import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '@/api/base44Client';
import { Loader2, ArrowLeft, Calendar, MapPin, Tag, FileText, Database, Image as ImageIcon, Video, BookOpen, Download, Globe, Shield, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { PrototypeTag } from '@/components/Badges';

const ICONS = {
  report: FileText,
  dataset: Database,
  photograph: ImageIcon,
  video: Video,
  publication: BookOpen,
  news: Globe
};

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAsset() {
      try {
        setLoading(true);
        const data = await db.entities.Asset.get(id);
        if (!data) {
          setError("Asset not found.");
        } else {
          setAsset(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load asset details.");
      } finally {
        setLoading(false);
      }
    }
    fetchAsset();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/30">
        <Loader2 className="h-10 w-10 animate-spin text-[#4DA8D8]" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="container mx-auto py-16 px-4 text-center max-w-2xl">
        <h2 className="text-2xl font-bold text-[#071A2B] mb-4">{error || "Asset Not Found"}</h2>
        <p className="text-muted-foreground mb-8">The requested asset may have been removed or you don't have permission to view it.</p>
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 bg-[#4DA8D8] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#3d8cb5] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  const Icon = ICONS[asset.content_type] || FileText;

  return (
    <div className="min-h-screen bg-[#F5F8FA]">
      {/* Header Banner */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[#4DA8D8] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Explore
          </button>
          
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4DA8D8]/10 text-[#4DA8D8] rounded-full text-xs font-semibold uppercase tracking-wider">
                  <Icon className="w-3.5 h-3.5" />
                  {asset.content_type || "Resource"}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold uppercase tracking-wider">
                  {asset.access_class || "Open Access"}
                </span>
                {asset.is_prototype && <PrototypeTag />}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-[#071A2B] leading-tight mb-4">{asset.title}</h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground font-medium">
                {asset.year && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#4DA8D8]" /> {asset.year}
                  </div>
                )}
                {asset.region && (
                  <div className="flex items-center gap-2 capitalize">
                    <Globe className="w-4 h-4 text-[#4DA8D8]" /> {asset.region.replace('_', ' ')}
                  </div>
                )}
                {asset.station_id && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#4DA8D8]" /> {asset.station_id}
                  </div>
                )}
                {asset.research_theme && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#4DA8D8]" /> {asset.research_theme}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button className="inline-flex items-center justify-center gap-2 bg-[#4DA8D8] hover:bg-[#3d8cb5] text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Download
              </button>
              {asset.file_uri && (
                <a href={asset.file_uri} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 bg-white border border-border hover:bg-gray-50 text-[#071A2B] px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm">
                  <ExternalLink className="w-4 h-4" /> View File
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {asset.thumbnail_url && (
              <div className="rounded-xl overflow-hidden border border-border shadow-sm bg-white aspect-video relative">
                <img src={asset.thumbnail_url} alt={asset.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#071A2B] mb-4 border-b border-border pb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {asset.description || "No detailed description available for this asset."}
              </p>
            </div>

            {asset.summary && (
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#071A2B] mb-4 border-b border-border pb-2">Executive Summary</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {asset.summary}
                </p>
              </div>
            )}
            
            {asset.keywords && asset.keywords.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#071A2B] mb-4 border-b border-border pb-2">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {asset.keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-md font-bold text-[#071A2B] mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4DA8D8]" /> Metadata
              </h3>
              
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground font-medium mb-1">Asset ID</dt>
                  <dd className="text-[#071A2B] font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">{asset.id}</dd>
                </div>
                
                {asset.creator && (
                  <div>
                    <dt className="text-muted-foreground font-medium mb-1">Creator</dt>
                    <dd className="text-[#071A2B] font-medium">{asset.creator}</dd>
                  </div>
                )}
                
                {asset.contributor && (
                  <div>
                    <dt className="text-muted-foreground font-medium mb-1">Contributor</dt>
                    <dd className="text-[#071A2B] font-medium">{asset.contributor}</dd>
                  </div>
                )}
                
                {asset.publisher && (
                  <div>
                    <dt className="text-muted-foreground font-medium mb-1">Publisher</dt>
                    <dd className="text-[#071A2B] font-medium">{asset.publisher}</dd>
                  </div>
                )}

                {asset.license && (
                  <div>
                    <dt className="text-muted-foreground font-medium mb-1">License</dt>
                    <dd className="text-[#071A2B] font-medium">{asset.license}</dd>
                  </div>
                )}

                {(asset.file_size || asset.file_format) && (
                  <div>
                    <dt className="text-muted-foreground font-medium mb-1">File Information</dt>
                    <dd className="text-[#071A2B] font-medium">
                      {asset.file_format?.toUpperCase()} {asset.file_size ? `(${asset.file_size})` : ''}
                    </dd>
                  </div>
                )}
                
                {asset.citation && (
                  <div className="pt-2 border-t border-border">
                    <dt className="text-muted-foreground font-medium mb-2">Recommended Citation</dt>
                    <dd className="text-gray-600 text-xs italic bg-gray-50 p-3 rounded border border-gray-100">
                      {asset.citation}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
