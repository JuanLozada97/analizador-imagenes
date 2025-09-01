import { Badge } from "@/components/ui/badge";

interface Tag {
  label: string;
  confidence: number;
}

interface TagsPillsProps {
  tags: Tag[];
  title?: string;
}

const getConfidenceVariant = (confidence: number) => {
  if (confidence >= 0.9) return "success";
  if (confidence >= 0.7) return "info";
  if (confidence >= 0.5) return "warning";
  return "danger";
};

const formatConfidence = (confidence: number) => {
  return `${Math.round(confidence * 100)}%`;
};

const TagsPills = ({ tags, title = "Etiquetas detectadas" }: TagsPillsProps) => {
  // Sort tags by confidence (highest first)
  const sortedTags = [...tags].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {sortedTags.map((tag, index) => (
          <Badge
            key={index}
            variant={getConfidenceVariant(tag.confidence) as any}
            className="text-sm font-medium transition-all duration-200 hover:scale-105"
          >
            {tag.label} <span className="ml-1 opacity-80">({formatConfidence(tag.confidence)})</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagsPills;