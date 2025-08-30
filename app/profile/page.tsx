"use client";

import { useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import DirectoryLayout from "@/components/shared/DirectoryLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface BusinessProfile {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  licenseNumber: string;
  website: string;
  servicesOffered: string[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: "Tree Shop",
    ownerName: "",
    email: "office@fltreeshop.com",
    phone: "(386) 843-5266",
    address: "",
    city: "Central Florida",
    state: "FL", 
    zipCode: "",
    licenseNumber: "",
    website: "https://fltreeshop.com",
    servicesOffered: ["Forestry Mulching", "Land Clearing", "Tree Removal", "Stump Grinding"]
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Profile settings will be saved to Convex settings table
      console.log("Profile save functionality ready for implementation:", profile);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof BusinessProfile, value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...profile.servicesOffered];
    newServices[index] = value;
    setProfile(prev => ({
      ...prev,
      servicesOffered: newServices
    }));
  };

  const addService = () => {
    setProfile(prev => ({
      ...prev,
      servicesOffered: [...prev.servicesOffered, ""]
    }));
  };

  const removeService = (index: number) => {
    const newServices = profile.servicesOffered.filter((_, i) => i !== index);
    setProfile(prev => ({
      ...prev,
      servicesOffered: newServices
    }));
  };

  return (
    <AuthenticatedLayout>
      <DirectoryLayout
        title="Business Profile"
        subtitle="Manage your business information and settings"
        actions={
          !isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              variant="primary"
              size="sm"
            >
              ✏️ Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(false)}
                variant="secondary"
                size="sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-6">
          {/* Business Information */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Business Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => handleChange("businessName", e.target.value)}
                  />
                ) : (
                  <p className="text-white bg-gray-800 p-3 rounded">{profile.businessName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Owner Name
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={profile.ownerName}
                    onChange={(e) => handleChange("ownerName", e.target.value)}
                    placeholder="Enter owner name"
                  />
                ) : (
                  <p className="text-white bg-gray-800 p-3 rounded">{profile.ownerName || "Not set"}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  License Number
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={profile.licenseNumber}
                    onChange={(e) => handleChange("licenseNumber", e.target.value)}
                    placeholder="Enter license number"
                  />
                ) : (
                  <p className="text-white bg-gray-800 p-3 rounded">{profile.licenseNumber || "Not set"}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={profile.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                ) : (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-green-400 hover:text-green-300 bg-gray-800 p-3 rounded block"
                  >
                    {profile.website}
                  </a>
                )}
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                ) : (
                  <p className="text-white bg-gray-800 p-3 rounded">{profile.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                ) : (
                  <p className="text-white bg-gray-800 p-3 rounded">{profile.phone}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  value={profile.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Street address"
                />
              ) : (
                <p className="text-white bg-gray-800 p-3 rounded">{profile.address || "Not set"}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={profile.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                ) : (
                  <p className="text-white bg-gray-800 p-3 rounded">{profile.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  State
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={profile.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                  />
                ) : (
                  <p className="text-white bg-gray-800 p-3 rounded">{profile.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ZIP Code
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={profile.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                  />
                ) : (
                  <p className="text-white bg-gray-800 p-3 rounded">{profile.zipCode || "Not set"}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Services */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Services Offered</h3>
            
            {isEditing ? (
              <div className="space-y-3">
                {profile.servicesOffered.map((service, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      value={service}
                      onChange={(e) => handleServiceChange(index, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeService(index)}
                      variant="secondary"
                      size="sm"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addService}
                  variant="secondary"
                  size="sm"
                >
                  + Add Service
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.servicesOffered.map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Account Settings */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Email Notifications</h4>
                  <p className="text-sm text-gray-400">Receive notifications for new leads and proposals</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">SMS Alerts</h4>
                  <p className="text-sm text-gray-400">Receive text alerts for urgent matters</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Auto-logout</h4>
                  <p className="text-sm text-gray-400">Automatically logout after 24 hours</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
      </DirectoryLayout>
    </AuthenticatedLayout>
  );
}