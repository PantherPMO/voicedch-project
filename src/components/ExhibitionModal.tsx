import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users } from 'lucide-react';
import axiosInstance from '@/api/axios';
import { ArtifactCard } from './ArtifactCard';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface Artifact {
  _id: string;
  title: string;
  description: string;
  image: string;
  culture: string;
  period: string;
}

interface ExhibitionModalProps {
  exhibition: Exhibition | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const ExhibitionModal: React.FC<ExhibitionModalProps> = ({ exhibition, isOpen, onClose }) => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(false);

  const fetchArtifacts = async () => {
    if (!exhibition) return;
    setLoadingArtifacts(true);
    try {
      const response = await axiosInstance.get(`/api/exhibitions/${exhibition.slug}/artifacts`);
      setArtifacts(response.data);
    } catch (error) {
      console.error('Failed to fetch artifacts', error);
    } finally {
      setLoadingArtifacts(false);
    }
  };

  if (!exhibition) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <ScrollArea className="h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-playfair">{exhibition.title}</DialogTitle>
            <DialogDescription className="text-lg text-text-secondary">
              {exhibition.shortDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div>
              <img 
                src={exhibition.image} 
                alt={exhibition.title} 
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            <div>
              <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-4">
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
              <p className="text-text-secondary leading-relaxed">{exhibition.description}</p>
              <div className="mt-4">
                <Badge variant="secondary">{exhibition.category}</Badge>
                <Badge className={`ml-2 ${
                  exhibition.status === 'Current' ? 'bg-green-500' : 'bg-amber-500'
                } text-white`}>
                  {exhibition.status}
                </Badge>
              </div>
            </div>
          </div>
          <Accordion type="single" collapsible className="w-full mt-8">
            <AccordionItem value="artifacts">
              <AccordionTrigger onClick={fetchArtifacts} disabled={loadingArtifacts}>
                {loadingArtifacts ? 'Loading Artifacts...' : 'View Artifacts'}
              </AccordionTrigger>
              <AccordionContent>
                {artifacts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artifacts.map((artifact) => (
                      <ArtifactCard key={artifact._id} artifact={artifact} />
                    ))}
                  </div>
                ) : (
                  <p>No artifacts found for this exhibition.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <DialogFooter className="mt-8">
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ExhibitionModal;