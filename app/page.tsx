"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Map from '@/components/ui/map';
import { useState } from "react";
import { Input } from '@/components/ui/input';
import { MapPin, Clock, DollarSign, Info, Calendar, Star, LogIn, UserPlus, History } from 'lucide-react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Location {
  name: string;
  lat: number;
  lng: number;
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);

  const extractLocations = async (text: string) => {
    const foundLocations: Location[] = [];
    
   
    const locationsMatch = text.match(/\*\*LOCATIONS:\*\*\n([\s\S]*?)(?=\n\n|$)/);
    if (!locationsMatch) {
      const altLocationsMatch = text.match(/LOCATIONS:\n([\s\S]*?)(?=\n\n|$)/);
      if (!altLocationsMatch) {
        return foundLocations;
      }
      
      const locationLines = altLocationsMatch[1].split('\n');
      for (const line of locationLines) {
        const placeName = line.replace(/^-\s*/, '').trim();
        if (!placeName) continue;
        
        try {
          const response = await fetch(`/api/places?query=${encodeURIComponent(placeName)}`);
          
          if (!response.ok) {
            console.error('Error response:', await response.text());
            continue;
          }

          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const place = data.results[0];
            
            if (!foundLocations.some(loc => loc.name === place.name)) {
              foundLocations.push({
                name: place.name,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              });
            }
          }
        } catch (error) {
          console.error('Error fetching location:', error);
        }
      }
      return foundLocations;
    }

    const locationLines = locationsMatch[1].split('\n');
    for (const line of locationLines) {
      const placeName = line.replace(/^-\s*/, '').trim();
      if (!placeName) continue;

      try {
        const response = await fetch(`/api/places?query=${encodeURIComponent(placeName)}`);
        
        if (!response.ok) {
          console.error('Error response:', await response.text());
          continue;
        }

        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const place = data.results[0];
          
          if (!foundLocations.some(loc => loc.name === place.name)) {
            foundLocations.push({
              name: place.name,
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            });
          }
        }
      } catch (error) {
        console.error('Error fetching location:', error);
      }
    }
    
    return foundLocations;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocations([]);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      setResult(data.result);
      
      // Save chat history if user is logged in
      if (session?.user) {
        try {
          await fetch('/api/chats', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt,
              response: data.result,
            }),
          });
        } catch (error) {
          console.error('Error saving chat history:', error);
        }
      }
      
      const foundLocations = await extractLocations(data.result);
      setLocations(foundLocations);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconForSection = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('gün') || lowerTitle.includes('day')) {
      return <Calendar className="w-6 h-6 text-blue-500" />;
    }
    if (lowerTitle.includes('budget') || lowerTitle.includes('maliyet') || lowerTitle.includes('ücret')) {
      return <DollarSign className="w-6 h-6 text-green-500" />;
    }
    if (lowerTitle.includes('tip') || lowerTitle.includes('öneri') || lowerTitle.includes('not')) {
      return <Info className="w-6 h-6 text-orange-500" />;
    }
    if (lowerTitle.includes('location') || lowerTitle.includes('konum') || lowerTitle.includes('yer')) {
      return <MapPin className="w-6 h-6 text-red-500" />;
    }
    return <Star className="w-6 h-6 text-purple-500" />;
  };

  const renderTravelPlan = (text: string) => {
    const sections = text.split('\n\n').filter(Boolean);
    
    return (
      <div className="space-y-6">
        {sections.map((section, index) => {
          const [title, ...content] = section.split('\n');
          const isMainSection = title.startsWith('**');
          const cleanTitle = title.replace(/\*\*/g, '').trim();
          
          if (cleanTitle.toLowerCase().includes('locations:')) {
            return null; // LOCATIONS bölümünü gizle
          }
          
          return (
            <div 
              key={index} 
              className={`group relative overflow-hidden ${
                isMainSection 
                  ? 'bg-gradient-to-br from-white via-blue-50/50 to-purple-50/30 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border-2 border-white/20 hover:shadow-3xl transform hover:scale-[1.01] transition-all duration-500' 
                  : 'bg-gradient-to-r from-white/90 to-gray-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300'
              }`}
            >
              {/* Arka plan dekoratif elementler */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-pink-200/20 to-yellow-200/20 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  {getIconForSection(cleanTitle)}
                  <h2 className={`${
                    isMainSection 
                      ? 'text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                      : 'text-xl font-semibold text-gray-700'
                  }`}>
                    {cleanTitle}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {content.map((line, lineIndex) => {
                    if (line.startsWith('- ')) {
                      return (
                        <div key={lineIndex} className="flex items-start space-x-4 p-4 bg-white/60 rounded-xl border border-gray-100/50 hover:bg-white/80 transition-all duration-200 group/item">
                          <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-3 group-hover/item:scale-125 transition-transform"></div>
                          <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed group-hover/item:text-gray-900 transition-colors">
                              {line.substring(2)}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    if (line.trim()) {
                      return (
                        <p key={lineIndex} className="text-gray-600 leading-relaxed text-lg bg-white/40 p-4 rounded-xl">
                          {line}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Auth Buttons */}
      <div className="absolute top-4 right-4 z-50 flex gap-4">
        {session ? (
          <>
            <Link href="/history">
              <Button
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                <History className="w-5 h-5 mr-2" />
                Geçmiş
              </Button>
            </Link>
            <Button
              onClick={() => signOut()}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Çıkış Yap
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Giriş Yap
            </Button>
            <Button
              onClick={() => router.push('/register')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Kayıt Ol
            </Button>
          </>
        )}
      </div>

      {/* Arka plan dekoratif elementler */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tr from-pink-200/30 to-yellow-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-200/20 to-blue-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8">
              <MapPin className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">AI Powered Travel Planning</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
              Seyahat Planlayıcı
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Yapay zeka ile hayalinizdeki seyahati planlayın. Kişiselleştirilmiş rotalar, öneriler ve haritalar.
            </p>
          </div>
          
          {/* Form Section */}
          <form onSubmit={handleSubmit} className="mb-16">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/20 hover:shadow-3xl transition-all duration-500">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="prompt" className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <Calendar className="w-6 h-6 text-blue-500" />
                    <span>Seyahat Planınızı Tanımlayın</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Örnek: 5 günlük Paris seyahati, müzeler ve cafe'ler dahil, orta seviye bütçe"
                      className="w-full text-lg py-6 px-6 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white backdrop-blur-sm text-gray-900 placeholder:text-gray-500 input-field"
                      style={{ 
                        color: '#1f2937',
                        backgroundColor: '#ffffff'
                      }}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>AI Planınızı Oluşturuyor...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <Star className="w-6 h-6" />
                      <span>Seyahat Planını Oluştur</span>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>

          {/* Results Section */}
          {result && (
            <div className="animate-fadeIn mb-16">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Kişiselleştirilmiş Seyahat Planınız
                </h2>
                <p className="text-gray-600 mt-2">AI tarafından özenle hazırlanmış detaylı planınız</p>
              </div>
              {renderTravelPlan(result)}
            </div>
          )}

          {/* Map Section */}
          {locations.length > 0 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  Seyahat Rotanız
                </h2>
                <p className="text-gray-600">Planınızdaki tüm konumları harita üzerinde keşfedin</p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border-2 border-white/20 overflow-hidden">
                <div className="h-96 rounded-2xl overflow-hidden">
                  <Map markers={locations} />
                </div>
                
                {/* Location List */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.map((location, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-gray-200/50">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{location.name}</p>
                        <p className="text-sm text-gray-500">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}