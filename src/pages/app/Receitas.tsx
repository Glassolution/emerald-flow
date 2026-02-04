import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Plus, Trash2, Calendar, ChevronRight, Search, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { 
  getRecipes,
  deleteRecipe,
  formatRecipeDate,
  type Recipe 
} from "@/lib/recipesService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function Receitas() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [recipeDescription, setRecipeDescription] = useState("");

  useEffect(() => {
    if (user) {
      loadRecipes();
    }
  }, [user]);

  const loadRecipes = async () => {
    if (!user) return;
    setIsLoading(true);
    const allRecipes = await getRecipes(user.id);
    setRecipes(allRecipes);
    setIsLoading(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm(t('recipes.deleteConfirm'))) {
      if (!user) return;
      const { error } = await deleteRecipe(user.id, id);
      
      if (error) {
        toast({
          title: t('common.error'),
          description: error.message || t('recipes.deleteError'),
          variant: "destructive",
        });
      } else {
        loadRecipes();
        toast({
          title: t('recipes.deleted'),
          description: t('recipes.deletedDesc'),
        });
      }
    }
  };

  const handleCardClick = (recipe: Recipe) => {
    // Navegar para calculadora com receita pré-preenchida
    navigate("/app/calc", {
      state: {
        recipe: {
          areaHa: recipe.area_ha,
          taxaLHa: recipe.taxa_l_ha,
          volumeTanqueL: recipe.volume_tanque_l,
          products: recipe.products.map(p => ({
            id: p.id,
            name: p.name,
            dose: p.dose,
            unit: p.unit,
          })),
        },
      },
    });
  };

  const handleCreateRecipe = async () => {
    if (!user) return;
    if (!recipeName.trim()) {
      toast({
        title: t('common.error'),
        description: t('recipes.nameRequired'),
        variant: "destructive",
      });
      return;
    }

    // Por enquanto, criar receita vazia (usuário pode editar depois)
    // Em uma versão futura, pode abrir um modal completo para criar receita
    toast({
      title: t('recipes.inDevelopment'),
      description: t('recipes.createFeatureComing'),
    });
    setAddModalOpen(false);
    setRecipeName("");
    setRecipeDescription("");
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(search.toLowerCase()) ||
    recipe.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-fade-in pt-4">
        <div className="w-12 h-12 border-2 border-gray-300 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm text-[#8a8a8a]">{t('recipes.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a]">{t('recipes.title')}</h1>
          <p className="text-[12px] text-[#8a8a8a]">
            {filteredRecipes.length} {t('common.of')} {recipes.length} {recipes.length !== 1 ? t('recipes.recipes') : t('recipes.recipe')}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={t('recipes.searchPlaceholder')}
          className="w-full h-11 pl-10 pr-4 bg-white rounded-full text-[14px] text-[#1a1a1a] placeholder:text-[#8a8a8a] focus:outline-none shadow-sm border border-gray-100"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Add Recipe Button */}
      <Button
        onClick={() => setAddModalOpen(true)}
        className="w-full h-12 bg-green-500 text-white rounded-xl hover:bg-green-600 font-semibold"
      >
        <Plus size={18} className="mr-2" />
        {t('recipes.createRecipe')}
      </Button>

      {/* Recipes List */}
      <div className="space-y-3">
        {filteredRecipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen size={32} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">{t('recipes.noRecipesTitle')}</h2>
            <p className="text-sm text-[#8a8a8a] max-w-[250px]">
              {t('recipes.noRecipesDesc')}
            </p>
          </div>
        ) : (
          filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => handleCardClick(recipe)}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all active:scale-[0.98]"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-[#1a1a1a] truncate">
                      {recipe.name}
                    </h3>
                    {recipe.description && (
                      <p className="text-[12px] text-[#8a8a8a] mt-0.5 line-clamp-1">
                        {recipe.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={12} className="text-[#8a8a8a] flex-shrink-0" />
                      <span className="text-[11px] text-[#8a8a8a]">
                        {formatRecipeDate(recipe.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => handleDelete(recipe.id, e)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Trash2 size={14} className="text-gray-600" />
                  </button>
                  <ChevronRight size={18} className="text-[#8a8a8a]" />
                </div>
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {recipe.tags.slice(0, 3).map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-[10px] px-2 py-0.5 bg-gray-50"
                    >
                      <Tag size={10} className="mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {recipe.tags.length > 3 && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-gray-50">
                      +{recipe.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">{t('calc.area')}</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {recipe.area_ha.toFixed(2)} ha
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">{t('calc.tankVolume')}</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {recipe.volume_tanque_l.toFixed(1)} L
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">{t('calc.rate')}</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {recipe.taxa_l_ha.toFixed(1)} L/ha
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#8a8a8a] mb-1">{t('calc.products')}</p>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">
                    {recipe.products.length} {recipe.products.length !== 1 ? t('calc.products').toLowerCase() : t('calc.product').toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Recipe Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('recipes.createRecipe')}</DialogTitle>
            <DialogDescription>
              {t('recipes.noRecipesDesc')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="recipe-name">{t('recipes.name')} *</Label>
              <Input
                id="recipe-name"
                placeholder={`Ex: ${t('recipes.name')}`}
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="recipe-description">{t('recipes.description')}</Label>
              <Textarea
                id="recipe-description"
                placeholder={t('recipes.description')}
                value={recipeDescription}
                onChange={(e) => setRecipeDescription(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreateRecipe}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {t('common.save')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setAddModalOpen(false);
                  setRecipeName("");
                  setRecipeDescription("");
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}




