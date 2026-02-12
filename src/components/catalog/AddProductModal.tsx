import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, X, Loader2 } from "lucide-react";
import type { ProductCategory, ProductUnit } from "@/types/product";
import { uploadProductImage } from "@/lib/productCatalogService";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (product: {
    name: string;
    category: ProductCategory;
    description: string;
    dose_value: number;
    dose_unit: ProductUnit;
    dose_min?: number;
    dose_max?: number;
    recommendations?: string;
    notes?: string;
    image_url?: string;
  }) => Promise<void>;
  editingProduct?: {
    id: string;
    name: string;
    category: ProductCategory;
    description: string;
    doseValue: number;
    doseUnit: ProductUnit;
    doseMin?: number;
    doseMax?: number;
    recommendations?: string;
    notes?: string;
    imageUrl?: string;
  } | null;
}

export function AddProductModal({
  open,
  onClose,
  onSubmit,
  editingProduct,
}: AddProductModalProps) {
  const [name, setName] = useState(editingProduct?.name || "");
  const [category, setCategory] = useState<ProductCategory>(
    editingProduct?.category || "Herbicida"
  );
  const [description, setDescription] = useState(editingProduct?.description || "");
  const [doseValue, setDoseValue] = useState(editingProduct?.doseValue.toString() || "");
  const [doseUnit, setDoseUnit] = useState<ProductUnit>(editingProduct?.doseUnit || "mL");
  const [doseMin, setDoseMin] = useState(editingProduct?.doseMin?.toString() || "");
  const [doseMax, setDoseMax] = useState(editingProduct?.doseMax?.toString() || "");
  const [recommendations, setRecommendations] = useState(editingProduct?.recommendations || "");
  const [notes, setNotes] = useState(editingProduct?.notes || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingProduct?.imageUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = editingProduct?.imageUrl || undefined;

      // Upload de imagem será feito após criar o produto (quando tivermos o ID)
      // Por enquanto, aceitamos URL manual ou base64 como fallback
      if (imageFile && imagePreview && imagePreview.startsWith("data:")) {
        // Se for base64, manteremos como está por enquanto
        // Em produção, fazer upload após criar produto
        imageUrl = imagePreview;
      }

      // Preparar dados, garantindo que strings vazias virem undefined
      const submitData: {
        name: string;
        category: ProductCategory;
        description: string;
        dose_value: number;
        dose_unit: ProductUnit;
        dose_min?: number;
        dose_max?: number;
        recommendations?: string;
        notes?: string;
        image_url?: string;
      } = {
        name: name.trim(),
        category,
        description: description.trim(),
        dose_value: parseFloat(doseValue) || 0,
        dose_unit: doseUnit,
      };

      // Adicionar campos opcionais apenas se tiverem valor válido
      const parsedDoseMin = doseMin ? parseFloat(doseMin) : null;
      if (parsedDoseMin !== null && !isNaN(parsedDoseMin) && parsedDoseMin > 0) {
        submitData.dose_min = parsedDoseMin;
      }

      const parsedDoseMax = doseMax ? parseFloat(doseMax) : null;
      if (parsedDoseMax !== null && !isNaN(parsedDoseMax) && parsedDoseMax > 0) {
        submitData.dose_max = parsedDoseMax;
      }

      if (recommendations.trim()) {
        submitData.recommendations = recommendations.trim();
      }

      if (notes.trim()) {
        submitData.notes = notes.trim();
      }

      if (imageUrl && imageUrl.trim()) {
        submitData.image_url = imageUrl.trim();
      }

      await onSubmit(submitData);

      // Reset form
      setName("");
      setCategory("Herbicida");
      setDescription("");
      setDoseValue("");
      setDoseUnit("mL");
      setDoseMin("");
      setDoseMax("");
      setRecommendations("");
      setNotes("");
      setImageFile(null);
      setImagePreview(null);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-bold">
            {editingProduct ? "Editar Produto" : "Adicionar Meu Produto"}
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            {editingProduct
              ? "Atualize as informações do seu produto personalizado."
              : "Crie um produto personalizado para usar nos seus cálculos."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <Label htmlFor="name" className="text-[13px] font-medium mb-2 block">
              Nome do Produto *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Glifosato 360"
              className="h-11 rounded-xl"
              required
            />
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="category" className="text-[13px] font-medium mb-2 block">
              Categoria (opcional)
            </Label>
            <Select value={category} onValueChange={(value: ProductCategory) => setCategory(value)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Herbicida">Herbicida</SelectItem>
                <SelectItem value="Inseticida">Inseticida</SelectItem>
                <SelectItem value="Fungicida">Fungicida</SelectItem>
                <SelectItem value="Fertilizante">Fertilizante</SelectItem>
                <SelectItem value="Adjuvante">Adjuvante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-[13px] font-medium mb-2 block">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Para que serve este produto..."
              className="min-h-[80px] rounded-xl"
            />
          </div>

          {/* Dose recomendada */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="doseValue" className="text-[13px] font-medium mb-2 block">
                Dose Recomendada (opcional)
              </Label>
              <Input
                id="doseValue"
                type="number"
                step="0.01"
                value={doseValue}
                onChange={(e) => setDoseValue(e.target.value)}
                placeholder="Ex: 200"
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="doseUnit" className="text-[13px] font-medium mb-2 block">
                Unidade (opcional)
              </Label>
              <Select
                value={doseUnit}
                onValueChange={(value: ProductUnit) => setDoseUnit(value)}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mL">mL/ha</SelectItem>
                  <SelectItem value="L">L/ha</SelectItem>
                  <SelectItem value="g">g/ha</SelectItem>
                  <SelectItem value="kg">kg/ha</SelectItem>
                  <SelectItem value="mL/L">mL/L</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Faixa recomendada (opcional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="doseMin" className="text-[13px] font-medium mb-2 block">
                Dose Mínima (opcional)
              </Label>
              <Input
                id="doseMin"
                type="number"
                step="0.01"
                value={doseMin}
                onChange={(e) => setDoseMin(e.target.value)}
                placeholder="Ex: 150"
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="doseMax" className="text-[13px] font-medium mb-2 block">
                Dose Máxima (opcional)
              </Label>
              <Input
                id="doseMax"
                type="number"
                step="0.01"
                value={doseMax}
                onChange={(e) => setDoseMax(e.target.value)}
                placeholder="Ex: 250"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Recomendações */}
          <div>
            <Label htmlFor="recommendations" className="text-[13px] font-medium mb-2 block">
              Recomendações (opcional)
            </Label>
            <Textarea
              id="recommendations"
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Ex: Aplicar em horário de menor vento..."
              className="min-h-[60px] rounded-xl"
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-[13px] font-medium mb-2 block">
              Observações de Mistura (opcional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Não misturar com X..."
              className="min-h-[60px] rounded-xl"
            />
          </div>

          {/* Upload de imagem */}
          <div>
            <Label className="text-[13px] font-medium mb-2 block">Foto do Produto (opcional)</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-xl"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleRemoveImage}
                >
                  <X size={14} />
                </Button>
              </div>
            ) : (
              <label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 transition-colors">
                  <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-[12px] text-gray-600">Clique para fazer upload</p>
                </div>
              </label>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-green-500 text-white rounded-xl hover:bg-green-600"
              disabled={isSubmitting || uploadingImage}
            >
              {isSubmitting || uploadingImage ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {uploadingImage ? "Enviando..." : "Salvando..."}
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
