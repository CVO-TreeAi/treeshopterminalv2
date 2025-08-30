"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface PhotoEntry {
  id: string;
  workOrderId: string;
  type: "before" | "after" | "progress";
  url: string;
  caption: string;
  timestamp: number;
  location?: { lat: number; lng: number };
}

export default function PhotosPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<string>("");
  const [photoType, setPhotoType] = useState<"before" | "after" | "progress">("progress");
  const [caption, setCaption] = useState("");
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Get today's work orders
  const todaysWorkOrders = useQuery(api.workOrders.getTodaysWorkOrders) || [];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        }
      );
    }
  }, []);

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedWorkOrder) {
      alert("Please select a work order first");
      return;
    }

    setIsUploading(true);
    
    try {
      // In production, upload to Convex file storage or cloud storage
      const mockUrl = URL.createObjectURL(file);
      
      const newPhoto: PhotoEntry = {
        id: `photo_${Date.now()}`,
        workOrderId: selectedWorkOrder,
        type: photoType,
        url: mockUrl,
        caption: caption || `${photoType} photo`,
        timestamp: Date.now(),
        location: location || undefined,
      };
      
      setPhotos(prev => [newPhoto, ...prev]);
      setCaption("");
      
      console.log("Photo uploaded:", newPhoto);
      
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Error uploading photo");
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const uploadPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <AuthenticatedLayout>
      <div className={`p-4 ${isMobile ? 'pb-20' : 'sm:p-6 lg:p-8'}`}>
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`font-bold text-green-500 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                Photo Documentation
              </h1>
              <p className="text-gray-400 mt-1">Before/after shots and progress photos</p>
            </div>
            
            {location && (
              <div className="text-right">
                <div className="text-xs text-green-400">📍 GPS Enabled</div>
                <div className="text-xs text-gray-500">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              </div>
            )}
          </div>

          {/* Photo Capture Interface */}
          <Card className="mb-8">
            <div className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Take Photo</h2>
              
              <div className="space-y-4">
                {/* Work Order Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Work Order *
                  </label>
                  <select
                    value={selectedWorkOrder}
                    onChange={(e) => setSelectedWorkOrder(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="">Select work order...</option>
                    {todaysWorkOrders.map((wo) => (
                      <option key={wo._id} value={wo._id}>
                        {wo.projectNumber} - {wo.customerName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Photo Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Photo Type
                  </label>
                  <div className={`grid gap-2 ${isMobile ? 'grid-cols-3' : 'grid-cols-3'}`}>
                    {[
                      { value: "before", label: "📷 Before", color: "blue" },
                      { value: "progress", label: "🔄 Progress", color: "yellow" },
                      { value: "after", label: "✅ After", color: "green" }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setPhotoType(type.value as any)}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          photoType === type.value
                            ? `border-${type.color}-500 bg-${type.color}-500/20 text-${type.color}-400`
                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500"
                    placeholder={`${photoType} photo description...`}
                  />
                </div>

                {/* Camera Buttons */}
                <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  <Button
                    onClick={takePhoto}
                    variant="primary"
                    className="py-4"
                    disabled={!selectedWorkOrder || isUploading}
                  >
                    📱 Take Photo
                  </Button>
                  <Button
                    onClick={uploadPhoto}
                    variant="secondary"
                    className="py-4"
                    disabled={!selectedWorkOrder || isUploading}
                  >
                    📁 Upload Photo
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Photos */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-4">
              Recent Photos ({photos.length})
            </h2>
            
            {photos.length > 0 ? (
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
                {photos.map((photo) => (
                  <Card key={photo.id}>
                    <div className="p-4">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={
                              photo.type === "before" ? "info" : 
                              photo.type === "after" ? "success" : "warning"
                            }
                          >
                            {photo.type}
                          </Badge>
                          <div className="text-xs text-gray-400">
                            {new Date(photo.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-sm text-gray-300">{photo.caption}</div>
                        {photo.location && (
                          <div className="text-xs text-gray-500">
                            📍 {photo.location.lat.toFixed(4)}, {photo.location.lng.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📸</div>
                  <div className="text-gray-400">No photos yet</div>
                  <div className="text-sm text-gray-500 mt-2">Take photos to document your work</div>
                </div>
              </Card>
            )}
          </div>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          
        </div>
      </div>
    </AuthenticatedLayout>
  );
}