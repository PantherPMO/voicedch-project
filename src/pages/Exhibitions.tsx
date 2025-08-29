import { Skeleton } from '@/components/ui/skeleton';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';
import axiosInstance from '@/api/axios';
import ExhibitionModal from '@/components/ExhibitionModal';

interface Exhibition {
  _id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  image: string;
  category: string;
  status: string;
  duration: string;
  artifacts: number;
  startDate: string;
  featured: boolean;
}

export const Exhibitions = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('All');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const searchPeriod = searchParams.get('period') || '';
  const searchCulture = searchParams.get('culture') || '';

  const openModal = (exhibition: Exhibition) => {
    setSelectedExhibition(exhibition);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedExhibition(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (searchPeriod) params.append('period', searchPeriod);
        if (searchCulture) params.append('culture', searchCulture);

        const response = await axiosInstance.get(`/api/exhibitions?${params.toString()}`);
        setExhibitions(response.data);
      } catch (err) {
        setError('Failed to fetch exhibitions');
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, [searchQuery, searchPeriod, searchCulture]);

  const categories = ['All', ...new Set(exhibitions.map(ex => ex.category))];
  const filteredExhibitions = filter === 'All' 
    ? exhibitions 
    : exhibitions.filter(ex => ex.category === filter);

  const featuredExhibitions = exhibitions.filter(ex => ex.featured);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
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
          There was a problem fetching the exhibitions. Please try again.
        </p>
        <Button onClick={fetchExhibitions}>Try Again</Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 text-center bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-text-primary mb-6">
            Curated Exhibitions
          </h1>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            Immersive narratives that bring history to life through carefully curated collections and expert storytelling.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                onClick={() => setFilter(category)}
                className="transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Exhibitions */}
      {filter === 'All' && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-text-primary mb-8 text-center">
              Featured Exhibitions
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredExhibitions.map((exhibition) => (
                <Card 
                  key={exhibition._id} 
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-ui-secondary"
                  onMouseEnter={() => setHoveredCard(exhibition.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={exhibition.image} 
                      alt={exhibition.title}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-text-primary/60 to-transparent" />
                    <Badge 
                      className={`absolute top-4 left-4 ${
                        exhibition.status === 'Current' ? 'bg-green-500' : 'bg-amber-500'
                      } text-white`}
                    >
                      {exhibition.status}
                    </Badge>
                    <Badge variant="secondary" className="absolute top-4 right-4">
                      {exhibition.category}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl font-playfair group-hover:text-primary transition-colors">
                      {exhibition.title}
                    </CardTitle>
                    <CardDescription className="text-text-secondary">
                      {exhibition.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-text-secondary leading-relaxed mb-4">
                      {exhibition.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {exhibition.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {exhibition.artifacts} artifacts
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(exhibition.startDate)}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      onClick={() => openModal(exhibition)}
                      className="w-full group-hover:bg-primary-dark transition-colors"
                      disabled={exhibition.status === 'Coming Soon'}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {exhibition.status === 'Coming Soon' ? 'Coming Soon' : 'Explore Exhibition'}
                        {exhibition.status !== 'Coming Soon' && (
                          <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${
                            hoveredCard === exhibition.id ? 'translate-x-1' : ''
                          }`} />
                        )}
                      </div>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Exhibitions Grid */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-text-primary mb-8 text-center">
            {filter === 'All' ? 'All Exhibitions' : `${filter} Exhibitions`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredExhibitions.map((exhibition) => (
              <Card 
                key={exhibition._id} 
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-ui-secondary"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={exhibition.image} 
                    alt={exhibition.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <Badge 
                    className={`absolute top-3 left-3 text-xs ${
                      exhibition.status === 'Current' ? 'bg-green-500' : 'bg-amber-500'
                    } text-white`}
                  >
                    {exhibition.status}
                  </Badge>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {exhibition.category}
                    </Badge>
                    <span className="text-xs text-text-secondary">{exhibition.duration}</span>
                  </div>
                  <CardTitle className="text-lg font-playfair leading-tight group-hover:text-primary transition-colors">
                    {exhibition.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">
                    {exhibition.shortDescription}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {exhibition.artifacts}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(exhibition.startDate)}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    onClick={() => openModal(exhibition)}
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    disabled={exhibition.status === 'Coming Soon'}
                  >
                    {exhibition.status === 'Coming Soon' ? 'Coming Soon' : 'Read Exhibition'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-playfair font-bold text-text-primary mb-6">
            Discover More Treasures
          </h2>
          <p className="text-lg text-text-secondary mb-8 leading-relaxed">
            Explore our full collection of artifacts and discover the stories behind each piece.
          </p>
          <Button asChild size="lg">
            <Link to="/explore">Browse Collection</Link>
          </Button>
        </div>
      </section>

      <ExhibitionModal 
        exhibition={selectedExhibition} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </main>
  );
};