/**
 * Componente AvatarPicker - Reutilizável para upload de foto de perfil
 * Mobile-first, simples e didático
 */

import { useRef, useState } from "react";
import { Camera, User, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAvatar, removeAvatar, validateImageFile } from "@/lib/avatarService";
import { useToast } from "@/hooks/use-toast";

interface AvatarPickerProps {
  avatarUrl: string | null;
  onAvatarChange: (url: string | null) => void;
  size?: "sm" | "md" | "lg";
  showControls?: boolean; // Se true, mostra botões "Trocar" e "Remover"
  className?: string;
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

const iconSizes = {
  sm: 20,
  md: 40,
  lg: 56,
};

export function AvatarPicker({
  avatarUrl,
  onAvatarChange,
  size = "md",
  showControls = false,
  className = "",
}: AvatarPickerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Erro",
        description: validation.error || "Arquivo inválido",
        variant: "destructive",
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    const { url, error } = await uploadAvatar(file);

    setIsUploading(false);
    setPreviewUrl(null);

    if (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao fazer upload da foto.",
        variant: "destructive",
      });
    } else if (url) {
      onAvatarChange(url);
      toast({
        title: "Sucesso",
        description: "Foto atualizada com sucesso!",
      });
    }

    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    const { error } = await removeAvatar();

    setIsUploading(false);

    if (error) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover foto.",
        variant: "destructive",
      });
    } else {
      onAvatarChange(null);
      toast({
        title: "Sucesso",
        description: "Foto removida com sucesso!",
      });
    }
  };

  const displayUrl = previewUrl || avatarUrl;
  const iconSize = iconSizes[size];

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Avatar */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden ${
            displayUrl ? "bg-gray-100" : "bg-[#1a1a1a]"
          } flex items-center justify-center`}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={iconSize} className="text-white/70" />
          )}
        </div>

        {/* Botão de câmera (sempre visível) */}
        <button
          onClick={handleFileSelect}
          disabled={isUploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#22c55e] flex items-center justify-center shadow-md hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <Loader2 size={14} className="text-white animate-spin" />
          ) : (
            <Camera size={14} className="text-white" />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Controles opcionais */}
      {showControls && (
        <div className="flex gap-2">
          <Button
            onClick={handleFileSelect}
            disabled={isUploading}
            variant="outline"
            size="sm"
            className="text-[12px]"
          >
            {avatarUrl ? "Trocar foto" : "Adicionar foto"}
          </Button>
          {avatarUrl && (
            <Button
              onClick={handleRemove}
              disabled={isUploading}
              variant="outline"
              size="sm"
              className="text-[12px] text-destructive hover:text-destructive"
            >
              <X size={14} className="mr-1" />
              Remover
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

