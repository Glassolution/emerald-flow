/**
 * Componente Avatar - Exibe avatar do usuário (sem controles)
 * Se não tiver foto, mostra ícone neutro
 */

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatarService";
import { Link } from "react-router-dom";

interface AvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  linkTo?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-11 h-11",
  lg: "w-16 h-16",
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function Avatar({ size = "md", className = "", linkTo }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadAvatar = async () => {
      setIsLoading(true);
      setHasError(false);
      const url = await getAvatarUrl();
      setAvatarUrl(url);
      setIsLoading(false);
    };
    loadAvatar();
  }, []);

  const avatarContent = (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden ${
        avatarUrl && !hasError ? "bg-gray-100" : "bg-[#E0E0E0]"
      } flex items-center justify-center ${className}`}
    >
      {isLoading ? (
        <div className="w-full h-full bg-gray-200 animate-pulse" />
      ) : avatarUrl && !hasError ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <User size={iconSizes[size]} className="text-[#9CA3AF] fill-[#9CA3AF]" />
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
}

