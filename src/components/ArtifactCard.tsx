import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Artifact {
  _id: string;
  title: string;
  description: string;
  image: string;
  culture: string;
  period: string;
}

interface ArtifactCardProps {
  artifact: Artifact;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({ artifact }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{artifact.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <img src={artifact.image} alt={artifact.title} className="w-full h-48 object-cover rounded-lg mb-4" />
        <p className="text-text-secondary">{artifact.description}</p>
        <div className="mt-4">
          <p className="text-sm text-text-secondary">Culture: {artifact.culture}</p>
          <p className="text-sm text-text-secondary">Period: {artifact.period}</p>
        </div>
      </CardContent>
    </Card>
  );
};