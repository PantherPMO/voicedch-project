import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, MapPin, Calendar, Heart, Eye } from "lucide-react";
import axiosInstance from "@/api/axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ArtifactCardImage = ({ src, alt }: { src: string; alt: string; }) => {
      const [imageError, setImageError] = useState(false);

      if (!src || imageError) {
        return (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
        );
      }

      return (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
      );
    };

interface Artifact {
  _id: string;
  title: string;
  culture: string;
  period: string;
  location: string;
  description: string;
  materials: string[];
  image: string;
  featured: boolean;
}

export function Explore() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';
  const searchPeriod = searchParams.get('period') || '';
  const searchCulture = searchParams.get('culture') || '';

  // Local state for filters, initialized from URL params
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [localSelectedCulture, setLocalSelectedCulture] = useState(searchCulture);
  const [localSelectedPeriod, setLocalSelectedPeriod] = useState(searchPeriod);

  useEffect(() => {
    // Update local state when URL params change
    setLocalSearchQuery(searchQuery);
    setLocalSelectedCulture(searchCulture);
    setLocalSelectedPeriod(searchPeriod);
  }, [searchQuery, searchPeriod, searchCulture]);

  useEffect(() => {
    fetchArtifacts();
  }, []); // Run only once on component mount

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchArtifacts();
    }, 500); // Debounce for 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [localSearchQuery, localSelectedCulture, localSelectedPeriod]); // Depend on local state

  const fetchArtifacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (localSearchQuery) params.append('q', localSearchQuery);
      if (localSelectedCulture && localSelectedCulture !== "all") params.append('culture', localSelectedCulture);
      if (localSelectedPeriod && localSelectedPeriod !== "all") params.append('period', localSelectedPeriod);

      const response = await axiosInstance.get(`/api/artifacts?${params.toString()}`);
      setArtifacts(response.data);
    } catch (err) {
      setError("Failed to fetch artifacts");
    } finally {
      setLoading(false);
    }
  };

  const cultures = Array.from(new Set(artifacts.map(a => a.culture)));
  const periods = Array.from(new Set(artifacts.map(a => a.period)));

  const filteredArtifacts = artifacts.filter(artifact => {
    const matchesSearch = artifact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.culture.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCulture = !localSelectedCulture || localSelectedCulture === "all" || artifact.culture === localSelectedCulture;
    const matchesPeriod = !localSelectedPeriod || localSelectedPeriod === "all" || artifact.period === localSelectedPeriod;

    return matchesSearch && matchesCulture && matchesPeriod;
  });

  const toggleFavorite = (artifactId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(artifactId)) {
        newFavorites.delete(artifactId);
      } else {
        newFavorites.add(artifactId);
      }
      return newFavorites;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">{error}</h3>
        <p className="text-muted-foreground mb-4">
          There was a problem fetching the artifacts. Please try again.
        </p>
        <Button onClick={fetchArtifacts}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <main className="flex-1">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Explore the Collection
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Discover artifacts from cultures around the world. Use our advanced search and filtering
            system to find exactly what interests you, or let serendipity guide your exploration.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6" role="search" aria-label="Collection filters">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold mb-4 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Search & Filter
                </h2>

                {/* Search Input */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search artifacts..."
                      value={localSearchQuery}
                      onChange={(e) => {
                        setLocalSearchQuery(e.target.value);
                        setSearchParams(prev => {
                          const newParams = new URLSearchParams(prev);
                          if (e.target.value) {
                            newParams.set('q', e.target.value);
                          } else {
                            newParams.delete('q');
                          }
                          return newParams;
                        });
                      }}
                      className="pl-10"
                      aria-label="Search artifacts by title, description, or culture"
                    />
                  </div>

                  {/* Culture Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Culture</label>
                    <Select value={localSelectedCulture} onValueChange={(value) => {
                      setLocalSelectedCulture(value);
                      setSearchParams(prev => {
                        const newParams = new URLSearchParams(prev);
                        if (value && value !== "all") {
                          newParams.set('culture', value);
                        } else {
                          newParams.delete('culture');
                        }
                        return newParams;
                      });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All cultures" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All cultures</SelectItem>
                        {cultures.map(culture => (
                          <SelectItem key={culture} value={culture}>{culture}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Period Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Time Period</label>
                    <Select value={localSelectedPeriod} onValueChange={(value) => {
                      setLocalSelectedPeriod(value);
                      setSearchParams(prev => {
                        const newParams = new URLSearchParams(prev);
                        if (value && value !== "all") {
                          newParams.set('period', value);
                        } else {
                          newParams.delete('period');
                        }
                        return newParams;
                      });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All periods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All periods</SelectItem>
                        {periods.map(period => (
                          <SelectItem key={period} value={period}>{period}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clear Filters */}
                  {(searchQuery || localSelectedCulture !== "all" || localSelectedPeriod !== "all") && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLocalSearchQuery("");
                        setLocalSelectedCulture("all");
                        setLocalSelectedPeriod("all");
                        setSearchParams(new URLSearchParams()); // Clear all params
                      }}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Collection Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Artifacts:</span>
                    <span className="font-medium">{artifacts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Showing:</span>
                    <span className="font-medium">{filteredArtifacts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cultures:</span>
                    <span className="font-medium">{cultures.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Results Grid */}
          <section className="lg:col-span-3" aria-label="Artifact search results">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {filteredArtifacts.length} Artifact{filteredArtifacts.length !== 1 ? 's' : ''} Found
              </h2>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredArtifacts.map((artifact: any) => (
                <Card
                  key={artifact._id}
                  className="gentle-hover cursor-pointer group"
                  role="article"
                  aria-labelledby={`artifact-title-${artifact._id}`}
                >
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                      <ArtifactCardImage src={artifact.image} alt={artifact.title} />

                      {/* Featured Badge */}
                      {artifact.featured && (
                        <Badge className="absolute top-2 left-2 bg-primary">
                          Featured
                        </Badge>
                      )}

                      {/* Favorite Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(artifact._id);
                        }}
                        aria-label={`${favorites.has(artifact._id) ? 'Remove from' : 'Add to'} favorites`}
                      >
                        <Heart
                          className={`h-4 w-4 ${favorites.has(artifact._id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-muted-foreground'
                            }`}
                        />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3
                        id={`artifact-title-${artifact._id}`}
                        className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors"
                      >
                        {artifact.title}
                      </h3>

                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {artifact.location}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        {artifact.period}
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {artifact.description}
                      </p>

                      {/* Materials Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {artifact.materials.slice(0, 2).map((material) => (
                          <Badge key={material} variant="secondary" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                        {artifact.materials.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{artifact.materials.length - 2} more
                          </Badge>
                        )}
                      </div>

                      <Button variant="outline" size="sm" className="w-full"
                        onClick={() => {
                          setSelectedArtifact(artifact);
                          setIsModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredArtifacts.length === 0 && (
              <div className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No artifacts found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setLocalSearchQuery("");
                    setLocalSelectedCulture("all");
                    setLocalSelectedPeriod("all");
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
    {selectedArtifact && (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArtifact.title}</DialogTitle>
            <DialogDescription>
              Details about {selectedArtifact.title}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
              <ArtifactCardImage src={selectedArtifact.image} alt={selectedArtifact.title} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Culture</p>
                <p className="text-lg">{selectedArtifact.culture}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Period</p>
                <p className="text-lg">{selectedArtifact.period}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Location</p>
                <p className="text-lg">{selectedArtifact.location}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Description</p>
              <p className="text-base text-muted-foreground">{selectedArtifact.description}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Materials</p>
              <div className="flex flex-wrap gap-2">
                {selectedArtifact.materials.map((material) => (
                  <Badge key={material} variant="secondary">{material}</Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}