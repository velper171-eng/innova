import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";


const API_BASE = "/api";

const EXCHANGE_GROUPS = [
  {
    category: "Cereales y Harinas",
    icon: "🥞",
    color: "#fbbf24",
    title: "Cereales, Tubérculos e Harinas",
    description: "Aporte principal de carbohidratos complejos para energía muscular.",
    items: [
      { name: "Arroz blanco o integral cocido", portion: "80g", details: "6 cucharadas colmadas" },
      { name: "Avena en hojuelas", portion: "24g", details: "4 cucharadas colmadas" },
      { name: "Papa común cocida", portion: "83g", details: "1 unidad mediana" },
      { name: "Papa criolla", portion: "108g", details: "3 unidades medianas" },
      { name: "Yuca blanca cocida", portion: "62g", details: "1 trozo mediano" },
      { name: "Pan integral", portion: "32g", details: "1 tajada mediana" },
      { name: "Arepa delgada de maíz blanco", portion: "56g", details: "1 unidad pequeña" },
      { name: "Tortilla de maíz", portion: "30g", details: "1 unidad pequeña" }
    ]
  },
  {
    category: "Sustitutos",
    icon: "🍳",
    color: "#f97316",
    title: "Sustitutos de Huevo y Queso",
    description: "Fuentes de proteína y grasas saludables secundarias.",
    items: [
      { name: "Huevo de gallina entero", portion: "50g", details: "1 unidad" },
      { name: "Huevos de codorniz", portion: "50g", details: "5 unidades" },
      { name: "Queso campesino o cuajada", portion: "30g", details: "1 tajada pequeña" },
      { name: "Queso parmesano rallado", portion: "14g", details: "2 cucharadas colmadas" },
      { name: "Jamón de pavo cocido", portion: "46g", details: "2 tajadas delgadas" }
    ]
  },
  {
    category: "Carnes Magras",
    icon: "🍗",
    color: "#ef4444",
    title: "Carnes Magras y Pescados",
    description: "Fuentes de proteína pura para reparación e hipertrofia.",
    items: [
      { name: "Pechuga de pollo cocida (sin piel)", portion: "80g", details: "1/4 de unidad grande" },
      { name: "Lomo de cerdo magro", portion: "100g", details: "1/5 de libra" },
      { name: "Lomo de res a la plancha", portion: "100g", details: "1/5 de libra" },
      { name: "Atún enlatado en agua", portion: "120g", details: "1 lata entera" },
      { name: "Salmón rosado crudo", portion: "73g", details: "1 trozo pequeño" },
      { name: "Proteína de soya texturizada", portion: "60g", details: "2 cucharadas colmadas" }
    ]
  },
  {
    category: "Lácteos",
    icon: "🥛",
    color: "#3b82f6",
    title: "Lácteos y Yogures",
    description: "Aporte de calcio, probióticos y proteínas digestivas.",
    items: [
      { name: "Yogurt griego natural descremado (sin dulce)", portion: "200g", details: "1 vaso mediano" },
      { name: "Yogurt descremado Kéfir", portion: "200g", details: "1 vaso pequeño" },
      { name: "Bebida de soya sin dulce", portion: "200g", details: "1 vaso pequeño" },
      { name: "Leche de vaca semidescremada", portion: "200g", details: "1 vaso pequeño" }
    ]
  },
  {
    category: "Frutas",
    icon: "🍎",
    color: "#10b981",
    title: "Frutas Frescas",
    description: "Carbohidratos simples, vitaminas y antioxidantes limpios.",
    items: [
      { name: "Banano común", portion: "65g", details: "1 unidad pequeña" },
      { name: "Fresas frescas", portion: "161g", details: "9 unidades medianas" },
      { name: "Manzana con cáscara", portion: "112g", details: "1 unidad pequeña" },
      { name: "Kiwi", portion: "82g", details: "1 unidad mediana" },
      { name: "Guayaba manzana", portion: "169g", details: "1 unidad mediana" },
      { name: "Naranja fresca", portion: "147g", details: "1 unidad pequeña" }
    ]
  },
  {
    category: "Grasas y Nueces",
    icon: "🥑",
    color: "#84cc16",
    title: "Grasas y Nueces Saludables",
    description: "Ácidos grasos esenciales y soporte hormonal.",
    items: [
      { name: "Aceite de oliva o canola", portion: "5g", details: "1 cucharada sopera" },
      { name: "Aguacate Hass o común", portion: "30g", details: "1/4 unidad mediana" },
      { name: "Almendras tostadas sin sal", portion: "9g", details: "3 unidades medianas" },
      { name: "Maní sin sal tostado", portion: "10g", details: "1 cucharada sopera colmada" },
      { name: "Mantequilla de maní natural", portion: "8g", details: "1 cucharada dulcera colmada" },
      { name: "Pistacho tostado y salado", portion: "9g", details: "1 cucharada sopera colmada" }
    ]
  }
];


// Utility to compress and resize image before upload
const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve({ compressedFile, previewUrl: canvas.toDataURL("image/jpeg") });
            } else {
              reject(new Error("Canvas toBlob returned null"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const CalorieCounter = ({ patientId, isAdminMode = false }) => {
  // Navigation tabs: "diary" | "plan" | "products"
  const [subTab, setSubTab] = useState("diary");

  // --- NUTRITION DIARY STATE ---
  const [logs, setLogs] = useState([]);
  const [calorieGoal, setCalorieGoal] = useState(() => {
    const saved = localStorage.getItem(`calorie_goal_${patientId}`);
    return saved ? parseInt(saved, 10) : 2000;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(calorieGoal);
  
  // Selected Date
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Form inputs
  const [foodName, setFoodName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [preparation, setPreparation] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Status states
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [reAnalyzing, setReAnalyzing] = useState(false);

  const fileInputRef = useRef(null);
  const reAnalyzeTimeoutRef = useRef(null);

  // --- MEAL PLAN STATE ---
  const [activePlan, setActivePlan] = useState(null);
  const [planHistory, setPlanHistory] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);

  // Generator form inputs
  const [latestEval, setLatestEval] = useState(null);
  const [planGoal, setPlanGoal] = useState("maintenance");
  const [planActivityLevel, setPlanActivityLevel] = useState("1.55");
  const [planFormula, setPlanFormula] = useState("mifflin_st_jeor");
  const [planProteinFactor, setPlanProteinFactor] = useState("2.2");
  const [planFatFactor, setPlanFatFactor] = useState("0.8");
  const [planName, setPlanName] = useState("Plan de Nutrición Personalizado");
  
  // Custom manual parameters
  const [customWeight, setCustomWeight] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [customAge, setCustomAge] = useState("");
  const [customBodyFat, setCustomBodyFat] = useState("");

  // --- RECOMMENDED PRODUCTS STATE ---
  const [products, setProducts] = useState([]);
  const [productCategory, setProductCategory] = useState("Todos");
  const [productRegion, setProductRegion] = useState("Todos");

  // --- EXCHANGE SEARCH & FILTER STATE ---
  const [exchangeSearchQuery, setExchangeSearchQuery] = useState("");
  const [activeExchangeTab, setActiveExchangeTab] = useState("Todos");

  // --- ADD PRODUCT STATE ---
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Cereales y Harinas");
  const [newProdRegion, setNewProdRegion] = useState("Colombia");
  const [newProdIsLocal, setNewProdIsLocal] = useState(false);
  const [newProdLink, setNewProdLink] = useState("");
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdImageFile, setNewProdImageFile] = useState(null);
  const [newProdImagePreview, setNewProdImagePreview] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const productFileRef = useRef(null);


  useEffect(() => {
    fetchLogs();
    fetchActivePlan();
    fetchPlanHistory();
    fetchRecommendedProducts();
    fetchPatientData();
    return () => {
      if (reAnalyzeTimeoutRef.current) {
        clearTimeout(reAnalyzeTimeoutRef.current);
      }
    };
  }, [patientId]);

  // Fetch patient profile and latest evaluation to pre-populate setup form
  const fetchPatientData = async () => {
    try {
      // First, get latest evaluation for weight, height, bodyfat
      const resEval = await fetch(`${API_BASE}/patients/${patientId}`);
      if (resEval.ok) {
        const patientData = await resEval.json();
        if (patientData.evaluations && patientData.evaluations.length > 0) {
          // Get latest
          const latest = [...patientData.evaluations].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
          setLatestEval(latest);
          setCustomWeight(latest.weight || "");
          setCustomHeight(latest.height || "");
          setCustomAge(latest.age || "");
          setCustomBodyFat(latest.bodyFat || "");
          if (latest.bodyFat > 0) {
            setPlanFormula("katch_mcardle");
          }
        } else {
          // Try to calculate age from birthdate
          if (patientData.birthdate) {
            const birth = new Date(patientData.birthdate);
            const ageDifMs = Date.now() - birth.getTime();
            const ageDate = new Date(ageDifMs);
            setCustomAge(Math.abs(ageDate.getUTCFullYear() - 1970));
          }
        }
      }
    } catch (err) {
      console.error("Error loading patient data:", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/calories/logs`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Error fetching calorie logs:", err);
    }
  };

  const fetchActivePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/mealplans/active`);
      if (res.ok) {
        const data = await res.json();
        setActivePlan(data);
        // Sync diary calorie goal with plan target
        if (data.calories) {
          setCalorieGoal(data.calories);
          localStorage.setItem(`calorie_goal_${patientId}`, data.calories.toString());
        }
      } else {
        setActivePlan(null);
      }
    } catch (err) {
      console.error("Error loading active plan:", err);
    } finally {
      setLoadingPlan(false);
    }
  };

  const fetchPlanHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/mealplans`);
      if (res.ok) {
        const data = await res.json();
        setPlanHistory(data);
      }
    } catch (err) {
      console.error("Error loading plan history:", err);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products/recommended`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Error loading recommended products:", err);
    }
  };

  const handleProductImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { compressedFile, previewUrl } = await compressImage(file);
        setNewProdImageFile(compressedFile);
        setNewProdImagePreview(previewUrl);
      } catch (err) {
        console.error("Compression failed, using original:", err);
        setNewProdImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewProdImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleClearProductImage = () => {
    setNewProdImageFile(null);
    setNewProdImagePreview(null);
    if (productFileRef.current) {
      productFileRef.current.value = "";
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdCategory || !newProdDescription) {
      alert("Por favor llena todos los campos obligatorios.");
      return;
    }
    setAddingProduct(true);
    const formData = new FormData();
    formData.append("name", newProdName);
    formData.append("category", newProdCategory);
    formData.append("region", newProdRegion);
    formData.append("isLocalStore", newProdIsLocal);
    formData.append("purchaseLink", newProdLink || "");
    formData.append("description", newProdDescription);
    if (newProdImageFile) {
      formData.append("image", newProdImageFile);
    }

    try {
      const res = await fetch(`${API_BASE}/products/recommended`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        await fetchRecommendedProducts();
        setShowAddProductModal(false);
        // Reset form
        setNewProdName("");
        setNewProdCategory("Cereales y Harinas");
        setNewProdRegion("Colombia");
        setNewProdIsLocal(false);
        setNewProdLink("");
        setNewProdDescription("");
        setNewProdImageFile(null);
        setNewProdImagePreview(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Error al agregar producto.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor.");
    } finally {
      setAddingProduct(false);
    }
  };

  const handleGoalSave = (e) => {
    e.preventDefault();
    const g = parseInt(goalInput, 10) || 2000;
    setCalorieGoal(g);
    localStorage.setItem(`calorie_goal_${patientId}`, g.toString());
    setIsEditingGoal(false);
  };

  // Generate meal plan personalized engine trigger
  const handleGenerateMealPlan = async (e) => {
    e.preventDefault();
    setGeneratingPlan(true);
    setErrorMsg("");

    try {
      const resGen = await fetch(`${API_BASE}/patients/${patientId}/mealplans/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: customWeight,
          height: customHeight,
          age: customAge,
          goal: planGoal,
          activityLevel: planActivityLevel,
          formula: planFormula,
          bodyFat: customBodyFat,
          proteinFactor: planProteinFactor,
          fatFactor: planFatFactor
        })
      });

      if (!resGen.ok) {
        throw new Error("No se pudo generar el plan matemático. Revisa los parámetros.");
      }

      const generatedPlan = await resGen.json();

      // Save it automatically to database
      const resSave = await fetch(`${API_BASE}/patients/${patientId}/mealplans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planName,
          goal: planGoal,
          calories: generatedPlan.targetMacros.calories,
          protein: generatedPlan.targetMacros.protein,
          carbs: generatedPlan.targetMacros.carbs,
          fat: generatedPlan.targetMacros.fat,
          planJson: generatedPlan
        })
      });

      if (!resSave.ok) {
        throw new Error("El plan se calculó pero falló la inserción en la base de datos.");
      }

      await fetchActivePlan();
      await fetchPlanHistory();
      setSubTab("plan");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error al estructurar el plan.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg("");
      try {
        const { compressedFile, previewUrl } = await compressImage(file);
        setImageFile(compressedFile);
        setImagePreview(previewUrl);
      } catch (err) {
        console.error("Compression failed, using original file:", err);
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerAutoReAnalyze = (updatedIngredients, updatedPreparation, updatedFoodName) => {
    if (reAnalyzeTimeoutRef.current) {
      clearTimeout(reAnalyzeTimeoutRef.current);
    }

    reAnalyzeTimeoutRef.current = setTimeout(async () => {
      setReAnalyzing(true);
      setErrorMsg("");

      const finalFoodName = updatedFoodName !== undefined ? updatedFoodName : (result?.foodName || foodName || "");

      const formData = new FormData();
      formData.append("foodName", finalFoodName);
      formData.append("ingredients", updatedIngredients);
      formData.append("preparation", updatedPreparation);

      try {
        const res = await fetch(`${API_BASE}/patients/${patientId}/calories/analyze`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Error al recalcular nutrientes");
        }

        const data = await res.json();
        setResult(prev => {
          if (!prev) return null;
          return {
            ...data,
            foodName: finalFoodName,
            ingredients: updatedIngredients,
            preparation: updatedPreparation,
            imagePath: prev.imagePath || data.imagePath
          };
        });
      } catch (err) {
        console.error("Auto re-analysis error:", err);
      } finally {
        setReAnalyzing(false);
      }
    }, 1500);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setResult(null);
    setErrorMsg("");

    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.append("foodName", foodName);
    formData.append("ingredients", ingredients);
    formData.append("preparation", preparation);

    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/calories/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let errMsg = "Error al analizar el alimento";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (jsonErr) {
          if (res.status === 504) {
            errMsg = "Tiempo de espera agotado. Por favor, intenta de nuevo o con una imagen más pequeña.";
          } else {
            errMsg = `Error del servidor (${res.status})`;
          }
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error al conectar con el servidor de análisis");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToLog = async () => {
    if (!result) return;
    setSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/patients/${patientId}/calories/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          foodName: result.foodName,
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat,
          sugar: result.sugar,
          sodium: result.sodium,
          ingredients: result.ingredients,
          preparation: result.preparation,
          imagePath: result.imagePath
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Error al guardar el registro");
      }

      await fetchLogs();
      if (reAnalyzeTimeoutRef.current) {
        clearTimeout(reAnalyzeTimeoutRef.current);
      }
      setResult(null);
      setFoodName("");
      setIngredients("");
      setPreparation("");
      handleClearImage();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Error al guardar en el diario");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este registro de calorías?")) return;
    try {
      const res = await fetch(`${API_BASE}/calories/logs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logs by selected date
  const filteredLogs = logs.filter(log => log.date === selectedDate);
  const totalCaloriesToday = filteredLogs.reduce((sum, log) => sum + log.calories, 0);
  const totalProteinToday = filteredLogs.reduce((sum, log) => sum + (log.protein || 0), 0);
  const totalCarbsToday = filteredLogs.reduce((sum, log) => sum + (log.carbs || 0), 0);
  const totalFatToday = filteredLogs.reduce((sum, log) => sum + (log.fat || 0), 0);
  const totalSugarToday = filteredLogs.reduce((sum, log) => sum + (log.sugar || 0), 0);
  const totalSodiumToday = filteredLogs.reduce((sum, log) => sum + (log.sodium || 0), 0);

  // Math for Concentric Rings
  const pctCalories = Math.min(100, Math.round((totalCaloriesToday / calorieGoal) * 100));
  const pctProtein = Math.min(100, Math.round((totalProteinToday / (activePlan?.protein || 150)) * 100));
  const pctCarbs = Math.min(100, Math.round((totalCarbsToday / (activePlan?.carbs || 250)) * 100));
  const pctFat = Math.min(100, Math.round((totalFatToday / (activePlan?.fat || 80)) * 100));

  const getRingOffset = (pct, r) => {
    const circ = 2 * Math.PI * r;
    return circ - (pct / 100) * circ;
  };

  const getWeeklyData = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates.map(d => {
      const dayLogs = logs.filter(log => log.date === d);
      const dayCalories = dayLogs.reduce((sum, log) => sum + log.calories, 0);
      const dayName = new Date(d + "T00:00:00").toLocaleDateString("es-ES", { weekday: "short" });
      return {
        date: d,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1, 3),
        calories: dayCalories
      };
    });
  };
  const weeklyData = getWeeklyData();

  // Recommended products filtering
  const filteredProducts = products.filter(p => {
    const matchCat = productCategory === "Todos" || p.category === productCategory;
    const matchReg = productRegion === "Todos" || p.region.toLowerCase().includes(productRegion.toLowerCase());
    return matchCat && matchReg;
  });

  const categories = ["Todos", "Cereales y Harinas", "Lácteos y Quesos", "Snacks y Frutos Secos", "Esparcibles y Dulces", "Bebidas e Infusiones", "Suplementos y Proteínas"];
  const regions = ["Todos", "Colombia", "Medellín"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="animate-fade-in">
      
      {/* Premium subtabs navigation */}
      <div className="scroll-mask-container">
        <div className="glass-card subtabs-nav" style={{ padding: "8px", display: "flex", gap: "8px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "rgba(255,255,255,0.01)" }}>
          <button
            className={`tab-btn ${subTab === "diary" ? "active" : ""}`}
            onClick={() => setSubTab("diary")}
            style={{ padding: "8px 16px", fontSize: "0.85rem", fontWeight: 600, border: "none", borderRadius: "8px", flexShrink: 0 }}
          >
            📖 Diario de Alimentación
          </button>
          <button
            className={`tab-btn ${subTab === "plan" ? "active" : ""}`}
            onClick={() => setSubTab("plan")}
            style={{ padding: "8px 16px", fontSize: "0.85rem", fontWeight: 600, border: "none", borderRadius: "8px", flexShrink: 0 }}
          >
            📋 Plan de Alimentación
          </button>
          <button
            className={`tab-btn ${subTab === "products" ? "active" : ""}`}
            onClick={() => setSubTab("products")}
            style={{ padding: "8px 16px", fontSize: "0.85rem", fontWeight: 600, border: "none", borderRadius: "8px", flexShrink: 0 }}
          >
            🛒 Productos Recomendados
          </button>
        </div>
      </div>


      {/* --- TAB 1: DIARY --- */}
      {subTab === "diary" && (
        <>
          <div className="glass-card calorie-dashboard-grid">
            <div className="calorie-summary-left" style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
              <div style={{ position: "relative", width: "140px", height: "140px" }}>
                <svg height="140" width="140" style={{ transform: "rotate(-90deg)" }}>
                  <circle stroke="rgba(0, 0, 0, 0.05)" fill="transparent" strokeWidth="6" r="58" cx="70" cy="70" />
                  <circle stroke="rgba(0, 0, 0, 0.05)" fill="transparent" strokeWidth="6" r="48" cx="70" cy="70" />
                  <circle stroke="rgba(0, 0, 0, 0.05)" fill="transparent" strokeWidth="6" r="38" cx="70" cy="70" />
                  <circle stroke="rgba(0, 0, 0, 0.05)" fill="transparent" strokeWidth="6" r="28" cx="70" cy="70" />

                  <circle
                    stroke="#00f2fe" fill="transparent" strokeWidth="6" r="58" cx="70" cy="70"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 58}
                    style={{ strokeDashoffset: getRingOffset(pctCalories, 58), transition: "stroke-dashoffset 0.5s ease", filter: "drop-shadow(0 0 4px #00f2fe)" }}
                  />
                  <circle
                    stroke="#f43f5e" fill="transparent" strokeWidth="6" r="48" cx="70" cy="70"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 48}
                    style={{ strokeDashoffset: getRingOffset(pctProtein, 48), transition: "stroke-dashoffset 0.5s ease", filter: "drop-shadow(0 0 4px #f43f5e)" }}
                  />
                  <circle
                    stroke="#10b981" fill="transparent" strokeWidth="6" r="38" cx="70" cy="70"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 38}
                    style={{ strokeDashoffset: getRingOffset(pctCarbs, 38), transition: "stroke-dashoffset 0.5s ease", filter: "drop-shadow(0 0 4px #10b981)" }}
                  />
                  <circle
                    stroke="#fbbf24" fill="transparent" strokeWidth="6" r="28" cx="70" cy="70"
                    strokeLinecap="round" strokeDasharray={2 * Math.PI * 28}
                    style={{ strokeDashoffset: getRingOffset(pctFat, 28), transition: "stroke-dashoffset 0.5s ease", filter: "drop-shadow(0 0 4px #fbbf24)" }}
                  />
                </svg>
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-main)" }}>
                    {totalCaloriesToday}
                  </span>
                  <span style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    kcal
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                <span style={{ fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00f2fe" }} /> kcal
                </span>
                <span style={{ fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f43f5e" }} /> Prot
                </span>
                <span style={{ fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} /> Carb
                </span>
                <span style={{ fontSize: "0.65rem", display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fbbf24" }} /> Gras
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, justifyContent: "center" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="glow-text" style={{ fontSize: "1.3rem", margin: 0 }}>Consumo Diario</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{selectedDate}</span>
              </div>

              {isEditingGoal ? (
                <form onSubmit={handleGoalSave} style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <input
                    type="number"
                    className="form-input"
                    value={goalInput}
                    onChange={(e) => setGoalInput(parseInt(e.target.value) || "")}
                    style={{ padding: "6px 10px", fontSize: "0.85rem", maxWidth: "100px" }}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                    Listo
                  </button>
                </form>
              ) : (
                <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>Meta diaria: <strong>{calorieGoal} kcal</strong> ({pctCalories}%)</span>
                  {!isAdminMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setGoalInput(calorieGoal);
                        setIsEditingGoal(true);
                      }}
                      style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      ✏️
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <label className="form-label" style={{ margin: 0, fontSize: "0.75rem" }}>Ver fecha:</label>
                <input
                  type="date"
                  className="form-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ padding: "4px 8px", fontSize: "0.8rem", maxWidth: "140px", height: "auto" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Proteínas</span>
                  <span style={{ color: "#f43f5e", fontWeight: 700 }}>{totalProteinToday.toFixed(1)}g / {activePlan?.protein || 150}g</span>
                </div>
                <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (totalProteinToday / (activePlan?.protein || 150)) * 100)}%`, background: "#f43f5e", transition: "width 0.3s" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Carbohidratos</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>{totalCarbsToday.toFixed(1)}g / {activePlan?.carbs || 250}g</span>
                </div>
                <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (totalCarbsToday / (activePlan?.carbs || 250)) * 100)}%`, background: "#10b981", transition: "width 0.3s" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Grasas</span>
                  <span style={{ color: "#fbbf24", fontWeight: 700 }}>{totalFatToday.toFixed(1)}g / {activePlan?.fat || 80}g</span>
                </div>
                <div style={{ height: "6px", width: "100%", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (totalFatToday / (activePlan?.fat || 80)) * 100)}%`, background: "#fbbf24", transition: "width 0.3s" }} />
                </div>
              </div>
              <div style={{ opacity: 0.85 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "2px" }}>
                  <span style={{ color: "var(--text-muted)" }}>Azúcares (Límite 50g)</span>
                  <span style={{ color: "#a855f7", fontWeight: 600 }}>{totalSugarToday.toFixed(1)}g</span>
                </div>
                <div style={{ height: "4px", width: "100%", background: "var(--border-color)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, (totalSugarToday / 50) * 100)}%`, background: "#a855f7", transition: "width 0.3s" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h4 className="glow-text" style={{ fontSize: "1.15rem", margin: 0 }}>Cumplimiento Semanal de Calorías</h4>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "150px", padding: "16px 0 10px 0", position: "relative", marginTop: "10px" }}>
              <div style={{ position: "absolute", bottom: "90px", left: 0, right: 0, borderBottom: "1px dashed #00f2fe", opacity: 0.6, zIndex: 1 }} />
              <span style={{ position: "absolute", bottom: "95px", right: 0, fontSize: "0.65rem", color: "#00f2fe", fontWeight: 600, zIndex: 1 }}>Meta</span>

              {weeklyData.map((wd, idx) => {
                const ratio = wd.calories / calorieGoal;
                const barHeight = Math.min(110, Math.round(ratio * 80));
                const isGoalMet = wd.calories >= calorieGoal;
                
                return (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", flex: 1, zIndex: 2 }}>
                    <div style={{ height: "110px", width: "18px", background: "rgba(0, 0, 0, 0.03)", border: "1px solid var(--border-color)", borderRadius: "9px", display: "flex", alignItems: "flex-end", overflow: "hidden", position: "relative" }}>
                      <div style={{
                        height: `${barHeight}px`,
                        width: "100%",
                        background: isGoalMet ? "#10b981" : "#00f2fe",
                        borderRadius: "8px",
                        boxShadow: `0 0 8px ${isGoalMet ? "#10b981" : "#00f2fe"}`,
                        transition: "height 0.5s ease"
                      }} />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: wd.date === selectedDate ? "bold" : "normal" }}>{wd.dayName}</span>
                    <span style={{ fontSize: "0.65rem", color: wd.date === selectedDate ? "var(--text-main)" : "var(--text-muted)", fontWeight: "bold" }}>{wd.calories}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {!isAdminMode && (
            <div className="calorie-analyzer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <form onSubmit={handleAnalyze} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 className="glow-text" style={{ fontSize: "1.2rem", margin: 0 }}>Analizar Alimento con AI</h4>
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed var(--primary)",
                    borderRadius: "12px",
                    padding: "20px",
                    textAlign: "center",
                    cursor: "pointer",
                    background: "var(--bg-main)",
                    transition: "all var(--transition-fast)",
                    position: "relative",
                    minHeight: "150px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setImagePreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleClearImage(); }}
                        style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "2.5rem" }}>📷</span>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-main)", fontWeight: 500 }}>Toma o sube una foto del plato</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Arrastra la imagen o haz clic para abrir la cámara</span>
                    </div>
                  )}
                </div>

                <input type="file" accept="image/*" style={{ display: "none" }} ref={fileInputRef} onChange={handleImageChange} />

                <div className="form-group">
                  <label className="form-label">Nombre del Plato (Opcional)</label>
                  <input type="text" className="form-input" placeholder="Ej: Pollo a la plancha con arroz" value={foodName} onChange={(e) => setFoodName(e.target.value)} />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Ingredientes y Cantidades (Opcional)</span>
                    <span style={{ fontSize: "0.7rem", color: "var(--primary)" }}>✓ Más Preciso</span>
                  </label>
                  <textarea className="form-input" placeholder="Ej: 150g pechuga de pollo, 1 taza de arroz blanco cocido" value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={3} style={{ resize: "none" }} />
                </div>

                <div className="form-group">
                  <label className="form-label">Preparación (Opcional)</label>
                  <input type="text" className="form-input" placeholder="Ej: Cocinado con 1 cucharadita de aceite" value={preparation} onChange={(e) => setPreparation(e.target.value)} />
                </div>

                {errorMsg && <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255, 69, 0, 0.08)", border: "1px solid rgba(255, 69, 0, 0.2)", color: "var(--error)", fontSize: "0.85rem" }}>⚠️ {errorMsg}</div>}

                <button type="submit" className="btn btn-primary" disabled={analyzing} style={{ padding: "12px", fontSize: "1rem" }}>
                  {analyzing ? "Analizando Plato con AI..." : "🥗 Analizar Plato con AI"}
                </button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {result ? (
                  <div className="glass-card animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                        <h4 style={{ fontSize: "1.2rem", color: "var(--text-main)", margin: 0 }}>Resultado del Análisis</h4>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>Plato:</span>
                          <input
                            type="text"
                            value={result.foodName || ""}
                            onChange={(e) => {
                              const newFoodName = e.target.value;
                              setResult(prev => ({ ...prev, foodName: newFoodName }));
                              triggerAutoReAnalyze(result.ingredients || "", result.preparation || "", newFoodName);
                            }}
                            style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-main)", background: "transparent", border: "none", borderBottom: "1px dashed var(--primary)", padding: "2px 4px", flex: 1, outline: "none" }}
                          />
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "6px", background: result.simulated ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", border: `1px solid ${result.simulated ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}`, color: result.simulated ? "var(--warning)" : "var(--success)", fontWeight: 600 }}>
                        {result.simulated ? "Simulado Local" : "Gemini AI Real"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", position: "relative" }}>
                      {reAnalyzing && <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255, 255, 255, 0.85)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)", fontWeight: 600, fontSize: "0.9rem", gap: "8px" }}>Actualizando nutrientes...</div>}
                      
                      <div style={{ flex: 1, minWidth: "90px", padding: "10px", background: "var(--primary-glow)", border: "1px solid var(--primary)", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Calorías</span>
                        <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{result.calories} kcal</div>
                      </div>
                      <div style={{ flex: 1, minWidth: "70px", padding: "10px", background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Proteína</span>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f43f5e" }}>{result.protein}g</div>
                      </div>
                      <div style={{ flex: 1, minWidth: "70px", padding: "10px", background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Carbos</span>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#10b981" }}>{result.carbs}g</div>
                      </div>
                      <div style={{ flex: 1, minWidth: "70px", padding: "10px", background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "8px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Grasa</span>
                        <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fbbf24" }}>{result.fat}g</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem" }}>Ingredientes Estimados:</label>
                        <textarea
                          className="form-input"
                          value={result.ingredients || ""}
                          onChange={(e) => {
                            const newIngredients = e.target.value;
                            setResult(prev => ({ ...prev, ingredients: newIngredients }));
                            triggerAutoReAnalyze(newIngredients, result.preparation || "", result.foodName || "");
                          }}
                          rows={3}
                          style={{ fontSize: "0.8rem", resize: "none", background: "#ffffff", border: "1px dashed var(--border-color)" }}
                        />
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: "0.75rem" }}>Preparación:</label>
                        <input
                          type="text"
                          className="form-input"
                          value={result.preparation || ""}
                          onChange={(e) => {
                            const newPrep = e.target.value;
                            setResult(prev => ({ ...prev, preparation: newPrep }));
                            triggerAutoReAnalyze(result.ingredients || "", newPrep, result.foodName || "");
                          }}
                          style={{ fontSize: "0.8rem", background: "#ffffff", border: "1px dashed var(--border-color)" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setResult(null)} style={{ flex: 1, padding: "8px", fontSize: "0.8rem" }}>Descartar</button>
                      <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSaveToLog} style={{ flex: 2, padding: "8px", fontSize: "0.8rem" }}>
                        {saving ? "Guardando..." : "✓ Guardar en Diario"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "50px 20px", flex: 1 }}>
                    <span style={{ fontSize: "2rem" }}>🥗</span>
                    <h5 style={{ fontSize: "0.95rem", color: "var(--text-main)", marginTop: "12px", marginBottom: "6px" }}>Analizador Inactivo</h5>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", maxWidth: "280px", margin: 0 }}>Toma una foto de tu comida o escribe sus ingredientes a la izquierda para analizar sus calorías.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h4 className="glow-text" style={{ fontSize: "1.2rem", margin: 0 }}>Historial de Alimentos de Hoy</h4>

            {filteredLogs.length === 0 ? (
              <div style={{ color: "var(--text-dark)", textAlign: "center", padding: "30px", fontStyle: "italic", fontSize: "0.85rem" }}>
                Aún no has registrado comidas hoy.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {filteredLogs.map((log) => (
                  <div key={log.id} style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "12px", display: "flex", gap: "12px", alignItems: "center" }}>
                    {log.imagePath && (
                      <div style={{ width: "50px", height: "50px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-color)", flexShrink: 0 }}>
                        <img src={`${API_BASE}${log.imagePath}`} alt={log.foodName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                          <h5 style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: 600, margin: 0 }}>{log.foodName}</h5>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-dark)" }}>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span style={{ fontWeight: 800, color: "var(--primary)", fontSize: "1rem" }}>{log.calories} kcal</span>
                      </div>
                      <div style={{ display: "flex", gap: "10px", marginTop: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <span>P: <strong>{log.protein}g</strong></span>
                        <span>C: <strong>{log.carbs}g</strong></span>
                        <span>G: <strong>{log.fat}g</strong></span>
                      </div>
                    </div>
                    {!isAdminMode && (
                      <button className="btn" style={{ padding: "6px", background: "rgba(255,69,0,0.06)", color: "var(--error)", borderRadius: "50%", width: "30px", height: "30px", flexShrink: 0 }} onClick={() => handleDeleteLog(log.id)}>🗑</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* --- TAB 2: PERSONAL MEAL PLAN --- */}
      {subTab === "plan" && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loadingPlan ? (
            <div className="glass-card" style={{ display: "flex", justifyContent: "center", padding: "40px", color: "var(--text-muted)" }}>
              <span>Buscando plan de alimentación activo...</span>
            </div>
          ) : activePlan ? (
            <>
              {/* Profile Metabolic Dashboard */}
              <div className="glass-card" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px" }}>
                <div style={{ borderRight: "1px solid var(--border-color)", paddingRight: "20px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Plan Activo</span>
                  <h3 className="glow-text" style={{ fontSize: "1.4rem", margin: 0 }}>{activePlan.name}</h3>
                  <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--text-main)" }}>
                    <div>Fórmula: <strong>{activePlan.planJson?.formulaUsed || "Mifflin-St Jeor"}</strong></div>
                    <div>BMR (Tasa Metabólica): <strong>{activePlan.planJson?.bmr || Math.round(activePlan.calories / 1.5)} kcal</strong></div>
                    <div>Objetivo: <strong style={{ color: "var(--primary)" }}>{
                      activePlan.goal === "hypertrophy" ? "Aumento de Masa (Volumen)" :
                      activePlan.goal === "fat_loss" ? "Definición (Pérdida Grasa)" : "Mantenimiento"
                    }</strong></div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Calorías Meta:</span>
                    <strong style={{ fontSize: "1.4rem", color: "var(--primary)" }}>{activePlan.calories} Kcal / día</strong>
                  </div>
                  
                  {/* Macros Bars */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "2px" }}>
                      <span>Proteínas</span>
                      <span style={{ color: "#f43f5e", fontWeight: "bold" }}>{activePlan.protein}g ({activePlan.protein * 4} kcal)</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "30%", background: "#f43f5e" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "2px" }}>
                      <span>Carbohidratos</span>
                      <span style={{ color: "#10b981", fontWeight: "bold" }}>{activePlan.carbs}g ({activePlan.carbs * 4} kcal)</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "50%", background: "#10b981" }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "2px" }}>
                      <span>Grasas</span>
                      <span style={{ color: "#fbbf24", fontWeight: "bold" }}>{activePlan.fat}g ({activePlan.fat * 9} kcal)</span>
                    </div>
                    <div style={{ height: "6px", background: "var(--border-color)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "20%", background: "#fbbf24" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Exchanges Portions Board */}
              <div className="glass-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 className="glow-text" style={{ fontSize: "1.15rem", margin: 0 }}>Distribución Total de Porciones (Intercambios)</h4>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowExchangeModal(true)}
                    style={{ padding: "6px 12px", fontSize: "0.75rem", height: "auto" }}
                  >
                    📖 Ver Equivalencias y Sustitutos
                  </button>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "-6px" }}>
                  Equivalentes diarios asignados basados en la Lista Oficial de Intercambios.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "10px", marginTop: "12px" }}>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem" }}>🥛</span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Lácteos</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)" }}>{activePlan.planJson?.portions?.lacteos || 0}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem" }}>🍳</span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Sustitutos</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)" }}>{activePlan.planJson?.portions?.sustitutos || 0}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem" }}>🍗</span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Carnes Magras</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)" }}>{activePlan.planJson?.portions?.carnes || 0}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem" }}>🥞</span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Harinas</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)" }}>{activePlan.planJson?.portions?.harinas || 0}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem" }}>🍎</span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Frutas</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)" }}>{activePlan.planJson?.portions?.frutas || 0}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem" }}>🥦</span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Verduras</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)" }}>{activePlan.planJson?.portions?.verduras || 0}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem" }}>🥜</span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Nueces</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)" }}>{activePlan.planJson?.portions?.nueces || 0}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "8px 4px", textAlign: "center" }}>
                    <span style={{ fontSize: "1.2rem" }}>🥑</span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>Grasas</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)" }}>{activePlan.planJson?.portions?.grasas || 0}</div>
                  </div>
                </div>
              </div>

              {/* Schedule and Meal Timeline */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 className="glow-text" style={{ fontSize: "1.2rem", margin: 0 }}>Estructura y Horario del Día</h4>
                
                {activePlan.planJson?.meals?.map((meal, idx) => {
                  const mPortions = Object.entries(meal.portions)
                    .filter(([_, qty]) => qty > 0)
                    .map(([name, qty]) => {
                      const icon = name === "lacteos" ? "🥛" : name === "sustitutos" ? "🍳" : name === "carnes" ? "🍗" : name === "harinas" ? "🥞" : name === "frutas" ? "🍎" : name === "verduras" ? "🥦" : name === "nueces" ? "🥜" : "🥑";
                      const text = name === "lacteos" ? "Lácteo" : name === "sustitutos" ? "Sustituto" : name === "carnes" ? "Carne" : name === "harinas" ? "Harina" : name === "frutas" ? "Fruta" : name === "verduras" ? "Verdura" : name === "nueces" ? "Nuez" : "Grasa";
                      return `${icon} ${qty} ${text}${qty > 1 ? "s" : ""}`;
                    }).join("  |  ");

                  return (
                    <div key={idx} className="glass-card table-row-hover" style={{ display: "flex", gap: "16px", alignItems: "flex-start", padding: "16px", background: "rgba(255, 255, 255, 0.02)" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "80px", borderRight: "2px solid var(--primary)", paddingRight: "12px", flexShrink: 0 }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 800 }}>{meal.time}</span>
                        <span style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: 700, marginTop: "2px", textAlign: "center" }}>{meal.name}</span>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-dark)", background: "rgba(0,242,254,0.04)", padding: "4px 10px", borderRadius: "6px", display: "inline-block", fontWeight: 600, border: "1px solid rgba(0,242,254,0.1)" }}>
                          {mPortions || "Sin porciones calculadas"}
                        </div>
                        <div style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--text-main)", whiteSpace: "pre-line", lineHeight: "1.5" }}>
                          {meal.foods}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Regenerate Plan Button (if Coach/Admin, or let Athlete do it) */}
              {!isAdminMode && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (window.confirm("¿Seguro que deseas sobrescribir este plan de alimentación?")) {
                        setActivePlan(null);
                      }
                    }}
                    style={{ border: "1px dashed var(--error)", color: "var(--error)", padding: "8px 16px", fontSize: "0.8rem" }}
                  >
                    🔄 Recalcular y Sobrescribir Plan
                  </button>
                </div>
              )}
            </>
          ) : (
            // Form to generate meal plan if none is active
            <form onSubmit={handleGenerateMealPlan} className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <h3 className="glow-text" style={{ fontSize: "1.4rem", margin: 0 }}>Configurar Plan de Alimentación Personalizado</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "4px", margin: 0 }}>
                  Calcularemos tu tasa metabólica basal (TMB), gasto calórico total diario (GET) y porciones de intercambio basadas en tu cuerpo.
                </p>
              </div>

              {latestEval ? (
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(0, 242, 254, 0.05)", border: "1px solid rgba(0, 242, 254, 0.15)", fontSize: "0.8rem", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>📊 <strong>Última Evaluación Cargada:</strong> Peso: {latestEval.weight}kg | Estatura: {latestEval.height}cm | % Grasa: {latestEval.bodyFat ? `${latestEval.bodyFat}%` : "N/A"}</span>
                </div>
              ) : (
                <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(255, 69, 0, 0.05)", border: "1px solid rgba(255, 69, 0, 0.1)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  ⚠️ No se encontraron evaluaciones antropométricas previas. Completa los campos manuales a continuación.
                </div>
              )}

              <div className="grid-2-cols" style={{ gap: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Nombre del Plan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Objetivo Físico</label>
                  <select
                    className="form-input"
                    value={planGoal}
                    onChange={(e) => setPlanGoal(e.target.value)}
                  >
                    <option value="maintenance">Mantenimiento Corporal</option>
                    <option value="hypertrophy">Aumento de Masa Muscular (Superávit)</option>
                    <option value="fat_loss">Pérdida de Grasa (Déficit)</option>
                  </select>
                </div>
              </div>

              <div className="grid-4-cols" style={{ gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={customWeight}
                    onChange={(e) => setCustomWeight(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estatura (cm)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <input
                    type="number"
                    className="form-input"
                    value={customAge}
                    onChange={(e) => setCustomAge(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Porcentaje Grasa (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={customBodyFat}
                    onChange={(e) => setCustomBodyFat(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="grid-2-cols" style={{ gap: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Factor de Actividad Física (PAL)</label>
                  <select
                    className="form-input"
                    value={planActivityLevel}
                    onChange={(e) => setPlanActivityLevel(e.target.value)}
                  >
                    <option value="1.2">Sedentario (Poco o nada de ejercicio)</option>
                    <option value="1.375">Ligeramente Activo (Ejercicio 1-3 días/semana)</option>
                    <option value="1.55">Moderadamente Activo (Ejercicio 3-5 días/semana) [Recomendado]</option>
                    <option value="1.725">Muy Activo (Entrenamiento intenso 6-7 días/semana)</option>
                    <option value="1.9">Extremadamente Activo (Culturismo intenso / Doble turno)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fórmula Metabólica Basal (BMR)</label>
                  <select
                    className="form-input"
                    value={planFormula}
                    onChange={(e) => setPlanFormula(e.target.value)}
                  >
                    <option value="mifflin_st_jeor">Mifflin-St Jeor (Estándar Clínico)</option>
                    <option value="harris_benedict">Harris-Benedict Revisada (Clásica)</option>
                    <option value="katch_mcardle">Katch-McArdle (Basada en Masa Magra - Requiere %Grasa)</option>
                  </select>
                </div>
              </div>

              <div className="grid-2-cols" style={{ gap: "16px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
                <div className="form-group">
                  <label className="form-label">Factor de Proteína (g / kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={planProteinFactor}
                    onChange={(e) => setPlanProteinFactor(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Factor de Grasas (g / kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={planFatFactor}
                    onChange={(e) => setPlanFatFactor(e.target.value)}
                    required
                  />
                </div>
              </div>

              {errorMsg && <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255, 69, 0, 0.08)", border: "1px solid rgba(255, 69, 0, 0.2)", color: "var(--error)", fontSize: "0.85rem" }}>⚠️ {errorMsg}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={generatingPlan}
                style={{ padding: "12px", fontSize: "1rem", marginTop: "10px" }}
              >
                {generatingPlan ? "Generando Pautas y Distribuyendo..." : "⚡ Generar Plan de Alimentación y Pautas"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* --- TAB 3: RECOMMENDED PRODUCTS STORE --- */}
      {subTab === "products" && (
        <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Filters Bar */}
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h4 className="glow-text" style={{ fontSize: "1.15rem", margin: 0 }}>Catálogo de Recomendados Nutricionales</h4>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0, marginTop: "-4px" }}>
                  Productos validados que facilitan tu alimentación. Abierto a filtros por regiones para apoyar marcas locales.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAddProductModal(true)}
                style={{ padding: "8px 16px", fontSize: "0.8rem", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                ➕ Agregar Producto
              </button>
            </div>
            
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
              <div className="form-group" style={{ flex: 1, minWidth: "200px", margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Filtrar por Categoría:</label>
                <select
                  className="form-input"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                >
                  {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ flex: 1, minWidth: "150px", margin: 0 }}>
                <label className="form-label" style={{ fontSize: "0.75rem" }}>Región / País:</label>
                <select
                  className="form-input"
                  value={productRegion}
                  onChange={(e) => setProductRegion(e.target.value)}
                  style={{ padding: "6px 10px", fontSize: "0.8rem" }}
                >
                  {regions.map((r, i) => <option key={i} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
              No se encontraron productos en la categoría o región seleccionada.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {filteredProducts.map((p) => {
                // Get category emoji
                const categoryEmoji = p.category === "Cereales y Harinas" ? "🥞" :
                                      p.category === "Lácteos y Quesos" ? "🥛" :
                                      p.category === "Snacks y Frutos Secos" ? "🥜" :
                                      p.category === "Esparcibles y Dulces" ? "🍯" :
                                      p.category === "Bebidas e Infusiones" ? "🍵" :
                                      p.category === "Suplementos y Proteínas" ? "⚡" : "🛒";

                return (
                  <div
                    key={p.id}
                    className="glass-card product-card-hover animate-fade-in"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      padding: "14px",
                      background: p.isLocalStore ? "rgba(0, 242, 254, 0.02)" : "rgba(255,255,255,0.01)",
                      border: p.isLocalStore ? "1px solid rgba(0, 242, 254, 0.25)" : "1px solid var(--border-color)",
                      borderRadius: "16px",
                      position: "relative"
                    }}
                  >
                    {/* Visual Card Image */}
                    <div className="product-card-image-container">
                      {p.imagePath ? (
                        <img
                          src={`${API_BASE}${p.imagePath}`}
                          className="product-card-image"
                          alt={p.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML = `<div class="product-placeholder-gradient"><span class="product-placeholder-icon">${categoryEmoji}</span></div>`;
                          }}
                        />
                      ) : (
                        <div className="product-placeholder-gradient">
                          <span className="product-placeholder-icon">{categoryEmoji}</span>
                        </div>
                      )}
                    </div>

                    {/* Category icon header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "4px" }}>
                      <span style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: "rgba(255,255,255,0.05)",
                        color: "var(--text-muted)",
                        fontWeight: 600
                      }}>
                        {p.category}
                      </span>
                      {p.isLocalStore && (
                        <span style={{
                          fontSize: "0.65rem",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "rgba(0, 242, 254, 0.15)",
                          color: "var(--primary)",
                          fontWeight: 800,
                          border: "1px solid rgba(0, 242, 254, 0.3)"
                        }}>
                          ✨ TIENDA LOCAL
                        </span>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <h5 style={{ fontSize: "1rem", color: "var(--text-main)", fontWeight: 700, margin: 0, lineHeight: "1.3" }}>
                        {p.name}
                      </h5>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-dark)", marginTop: "3px", display: "inline-block" }}>
                        📍 Ubicación: <strong>{p.region}</strong>
                      </span>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px", lineHeight: "1.4" }}>
                        {p.description}
                      </p>
                    </div>

                    {/* Actions buttons */}
                    {p.purchaseLink ? (
                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
                        {p.isLocalStore ? (
                          <a
                            href={p.purchaseLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                            style={{
                              width: "100%",
                              textAlign: "center",
                              fontSize: "0.8rem",
                              padding: "8px",
                              display: "inline-block",
                              boxShadow: "0 0 10px rgba(0, 242, 254, 0.25)",
                              borderRadius: "20px"
                            }}
                          >
                            🛍️ Ordenar Directo (WhatsApp)
                          </a>
                        ) : (
                          <a
                            href={p.purchaseLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary"
                            style={{
                              width: "100%",
                              textAlign: "center",
                              fontSize: "0.8rem",
                              padding: "8px",
                              display: "inline-block",
                              borderRadius: "20px"
                            }}
                          >
                            🛒 Buscar en Supermercados
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px", textAlign: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", padding: "6px" }}>
                          🔗 Sin enlace de compra asignado
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* --- ADD RECOMMENDED PRODUCT MODAL --- */}
          {showAddProductModal && createPortal(
            <div
              className="modal-backdrop animate-fade-in"
              style={{
                position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                background: "rgba(47, 79, 79, 0.4)", backdropFilter: "blur(6px)",
                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
              }}
              onClick={() => setShowAddProductModal(false)}
            >
              <div
                className="glass-card exchange-modal-card animate-scale-in"
                style={{
                  width: "90%", maxWidth: "500px", padding: "24px",
                  display: "flex", flexDirection: "column", gap: "16px",
                  borderRadius: "20px", overflowY: "auto", maxHeight: "90vh"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                  <h3 className="glow-text" style={{ fontSize: "1.25rem", margin: 0 }}>Agregar Producto Recomendado</h3>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddProductModal(false)}
                    style={{ padding: "4px 8px", fontSize: "0.8rem", height: "auto" }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddProductSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Nombre del Producto *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej: Avena en Hojuelas Tosh"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      required
                      style={{ padding: "8px 12px", fontSize: "0.9rem" }}
                    />
                  </div>

                  <div className="grid-2-cols" style={{ gap: "12px" }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.75rem" }}>Categoría / Tipo *</label>
                      <select
                        className="form-input"
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        style={{ padding: "8px 12px", fontSize: "0.9rem" }}
                      >
                        {categories.filter(c => c !== "Todos").map((c, i) => (
                          <option key={i} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: "0.75rem" }}>Región / Ubicación</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ej: Colombia, Medellín"
                        value={newProdRegion}
                        onChange={(e) => setNewProdRegion(e.target.value)}
                        style={{ padding: "8px 12px", fontSize: "0.9rem" }}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0, flexDirection: "row", alignItems: "center", gap: "8px" }}>
                    <input
                      type="checkbox"
                      id="newProdIsLocal"
                      checked={newProdIsLocal}
                      onChange={(e) => setNewProdIsLocal(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label htmlFor="newProdIsLocal" className="form-label" style={{ margin: 0, fontSize: "0.8rem", textTransform: "none", cursor: "pointer" }}>
                      ¿Es marca local / venta por WhatsApp?
                    </label>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>
                      {newProdIsLocal ? "Enlace de WhatsApp (Opcional)" : "Enlace de Compra (Opcional)"}
                    </label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder={newProdIsLocal ? "https://wa.me/..." : "https://www.exito.com/..."}
                      value={newProdLink}
                      onChange={(e) => setNewProdLink(e.target.value)}
                      style={{ padding: "8px 12px", fontSize: "0.9rem" }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Descripción del Producto *</label>
                    <textarea
                      className="form-input"
                      placeholder="Describe el producto, sus propiedades y aporte nutricional..."
                      value={newProdDescription}
                      onChange={(e) => setNewProdDescription(e.target.value)}
                      rows={3}
                      required
                      style={{ padding: "8px 12px", fontSize: "0.9rem", resize: "none" }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>Foto del Producto (Opcional)</label>
                    <div
                      className="product-upload-box"
                      onClick={() => productFileRef.current?.click()}
                    >
                      {newProdImagePreview ? (
                        <div style={{ width: "100%", height: "100%", position: "relative" }}>
                          <img src={newProdImagePreview} className="product-upload-preview" alt="Product Preview" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleClearProductImage(); }}
                            style={{
                              position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.7)",
                              color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px",
                              cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "1.8rem" }}>📷</span>
                          <span style={{ fontSize: "0.8rem", color: "var(--text-main)", fontWeight: 500 }}>Subir foto del producto</span>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Haz clic para elegir una imagen</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={productFileRef}
                      style={{ display: "none" }}
                      onChange={handleProductImageChange}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "4px" }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowAddProductModal(false)}
                      style={{ flex: 1, padding: "8px 16px", fontSize: "0.85rem", borderRadius: "20px" }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={addingProduct}
                      style={{ flex: 2, padding: "8px 16px", fontSize: "0.85rem", borderRadius: "20px" }}
                    >
                      {addingProduct ? "Guardando..." : "✓ Registrar Producto"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}

        </div>
      )}


      {/* --- EQUIVALENCES / EXCHANGE MODAL --- */}
      {showExchangeModal && createPortal(
        <div
          className="modal-backdrop animate-fade-in"
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(47, 79, 79, 0.4)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
          }}
          onClick={() => {
            setShowExchangeModal(false);
            setExchangeSearchQuery("");
            setActiveExchangeTab("Todos");
          }}
        >
          <div
            className="glass-card exchange-modal-card animate-scale-in"
            style={{
              width: "95%", maxWidth: "680px", height: "82vh", padding: "24px",
              display: "flex", flexDirection: "column", gap: "16px",
              borderRadius: "20px", overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", flexShrink: 0 }}>
              <h3 className="glow-text" style={{ fontSize: "1.3rem", margin: 0 }}>Lista de Intercambios y Sustitutos</h3>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowExchangeModal(false);
                  setExchangeSearchQuery("");
                  setActiveExchangeTab("Todos");
                }}
                style={{ padding: "4px 8px", fontSize: "0.8rem", height: "auto" }}
              >
                Cerrar
              </button>
            </div>

            {/* Search and Category Filter pills */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0 }}>
              <div className="exchange-search-box">
                <span className="exchange-search-icon">🔍</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar alimento (ej: Arroz, Huevo, Aguacate...)"
                  value={exchangeSearchQuery}
                  onChange={(e) => setExchangeSearchQuery(e.target.value)}
                  style={{ width: "100%", padding: "10px 16px" }}
                />
              </div>

              <div className="exchange-pills-nav">
                {["Todos", "Cereales y Harinas", "Sustitutos", "Carnes Magras", "Lácteos", "Frutas", "Grasas y Nueces"].map((groupName, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`exchange-pill ${activeExchangeTab === groupName ? "active" : ""}`}
                    onClick={() => setActiveExchangeTab(groupName)}
                  >
                    {groupName}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                ¿No tienes a la mano un alimento recomendado? ¡Sustitúyelo por otro equivalente del mismo grupo de alimentos respetando su porción!
              </p>

              {/* Categorías e items filtrados */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {EXCHANGE_GROUPS
                  .filter(group => activeExchangeTab === "Todos" || group.category === activeExchangeTab)
                  .map((group, groupIdx) => {
                    // Filter items based on search query
                    const filteredItems = group.items.filter(item =>
                      item.name.toLowerCase().includes(exchangeSearchQuery.toLowerCase())
                    );

                    if (filteredItems.length === 0) return null;

                    return (
                      <div key={groupIdx} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ fontSize: "1.2rem" }}>{group.icon}</span>
                          <h4 style={{ fontSize: "0.95rem", color: "var(--text-main)", fontWeight: 700, margin: 0 }}>
                            {group.title}
                          </h4>
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 10px 0" }}>
                          {group.description}
                        </p>

                        <div className="exchange-grid">
                          {filteredItems.map((item, itemIdx) => (
                            <div
                              key={itemIdx}
                              className="exchange-card"
                              style={{ borderLeft: `3px solid ${group.color}` }}
                            >
                              <span
                                className="exchange-card-portion"
                                style={{ backgroundColor: `${group.color}15`, color: group.color, border: `1px solid ${group.color}35` }}
                              >
                                {item.portion}
                              </span>
                              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", marginTop: "4px" }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {item.details}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                {/* If all groups are empty due to filter */}
                {EXCHANGE_GROUPS.filter(group => activeExchangeTab === "Todos" || group.category === activeExchangeTab)
                  .every(group => group.items.filter(item => item.name.toLowerCase().includes(exchangeSearchQuery.toLowerCase())).length === 0) && (
                    <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>
                      No se encontraron alimentos que coincidan con la búsqueda.
                    </div>
                  )}
              </div>
            </div>
            
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowExchangeModal(false);
                  setExchangeSearchQuery("");
                  setActiveExchangeTab("Todos");
                }}
                style={{ padding: "8px 24px" }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default CalorieCounter;
