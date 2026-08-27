import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Trash2, Star, GripVertical, Info, ChevronDown, ChevronUp } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './ModalProdutos.module.css';
import { API_BASE_URL } from '../../api';
import { toast } from 'react-toastify';

// --- DND Sortable Item Component ---
function SortableImage({ image, onDelete, onHighlight }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.imageCard} ${image.isHighlight ? styles.isHighlight : ''}`}
    >
      {image.isHighlight && <div className={styles.highlightBadge}>Destaque</div>}
      
      {/* Drag Handle */}
      <div 
        className={styles.dragHandle}
        {...attributes} 
        {...listeners}
        style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,255,255,0.7)', borderRadius: '50%', padding: '4px', cursor: 'grab', zIndex: 3 }}
      >
        <GripVertical size={16} color="#333" />
      </div>

      <img src={image.url} alt="Preview" />
      <div className={styles.imageActions}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onHighlight(image.id); }}
          className={`${styles.actionBtn} ${styles.highlightBtn}`}
          title="Definir como Destaque"
        >
          <Star size={14} fill={image.isHighlight ? "#f1c40f" : "none"} color={image.isHighlight ? "#f1c40f" : "white"} />
          <span style={{ marginLeft: '4px' }}>Destaque</span>
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(image.id); }}
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          title="Excluir imagem"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export function ModalProdutos({ isOpen, onClose, produtoId = null, onSaveSuccess = null }) {
  const [activeTab, setActiveTab] = useState(1);
  const [categoriasInternas, setCategoriasInternas] = useState([]);
  const [integracoes, setIntegracoes] = useState([]);
  const [sugestoesCategoria, setSugestoesCategoria] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [mlAttributes, setMlAttributes] = useState([]);
  const [mlAttributeValues, setMlAttributeValues] = useState({});
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [showOnlyRequired, setShowOnlyRequired] = useState(true);
  const [openGroups, setOpenGroups] = useState({});

  const [errors, setErrors] = useState({});
  const [showWarningModal, setShowWarningModal] = useState(false);

  const carregarAtributosCategoria = async (integracaoId, categoryId, savedValues = null) => {
    if (!integracaoId || !categoryId) return;
    
    setLoadingAttributes(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/categoria-produto/mercado-livre/categoria/atributos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integracaoId: Number(integracaoId),
          ml_categoriaId: categoryId
        })
      });
      
      const data = await response.json();
      if (data.sucesso || data.dados.attributes) {
        const attrs = data.dados.attributes || [];
        setMlAttributes(attrs);
        
        // Initialize values
        const initialValues = {};
        attrs.forEach(attr => {
          if (attr.fieldType === 'number_unit') {
            initialValues[attr.id] = {
              value: '',
              unit: attr.defaultUnit || (attr.allowedUnits && attr.allowedUnits[0]) || ''
            };
          } else {
            initialValues[attr.id] = '';
          }
        });
        
        if (savedValues) {
          setMlAttributeValues({ ...initialValues, ...savedValues });
        } else {
          setMlAttributeValues(initialValues);
        }
        
        // Initialize accordion state - open all groups by default
        const initialOpen = {};
        attrs.forEach(attr => {
          initialOpen[attr.groupId || 'OTHERS'] = true;
        });
        setOpenGroups(initialOpen);
      } else {
        setMlAttributes([]);
        setMlAttributeValues({});
        toast.error(data.message || "Erro ao carregar atributos do Mercado Livre");
      }
    } catch (error) {
      console.error("Falha ao carregar atributos: ", error);
      toast.error("Falha ao carregar atributos da categoria Mercado Livre.");
    } finally {
      setLoadingAttributes(false);
    }
  };

  const toggleGroup = (groupId) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getGroupedAttributes = () => {
    const grouped = {};
    
    mlAttributes.forEach(attr => {
      let isRequired = attr.required;
      
      // Rule 4.A.1: GTIN and EMPTY_GTIN_REASON
      if (attr.id === 'EMPTY_GTIN_REASON') {
        const isGtinEmpty = !formData.gtin || formData.gtin.trim() === '';
        if (isGtinEmpty) {
          isRequired = true;
        } else {
          return;
        }
      }
      
      // Rule 4.A.2: Condition and GRADING
      if (attr.id === 'GRADING') {
        if (formData.condicao !== 'refurbished') {
          return;
        }
      }
      
      if (showOnlyRequired && !isRequired) {
        return;
      }
      
      const gId = attr.groupId || 'OTHERS';
      const gLabel = attr.groupLabel || 'Outros';
      
      if (!grouped[gId]) {
        grouped[gId] = {
          label: gLabel,
          items: []
        };
      }
      grouped[gId].items.push({ ...attr, isRequired });
    });
    
    // Sort items by relevance
    Object.keys(grouped).forEach(gId => {
      grouped[gId].items.sort((a, b) => {
        const relA = a.relevance !== undefined ? a.relevance : 9999;
        const relB = b.relevance !== undefined ? b.relevance : 9999;
        return relA - relB;
      });
    });
    
    return grouped;
  };

  const handleAttrChange = (attrId, val) => {
    setMlAttributeValues(prev => ({
      ...prev,
      [attrId]: val
    }));
    if (errors[`ml_attr_${attrId}`]) {
      setErrors(prev => ({ ...prev, [`ml_attr_${attrId}`]: false }));
    }
  };

  const handleNumUnitChange = (attrId, field, val) => {
    setMlAttributeValues(prev => ({
      ...prev,
      [attrId]: {
        ...prev[attrId],
        [field]: val
      }
    }));
    if (errors[`ml_attr_${attrId}`]) {
      setErrors(prev => ({ ...prev, [`ml_attr_${attrId}`]: false }));
    }
  };

  const renderAttributeField = (attr) => {
    const value = mlAttributeValues[attr.id];
    const hasError = errors[`ml_attr_${attr.id}`];
    
    const renderInput = () => {
      switch (attr.fieldType) {
        case 'text':
          return (
            <input 
              type="text"
              className={hasError ? styles.errorBorder : ''}
              value={value || ''}
              onChange={(e) => handleAttrChange(attr.id, e.target.value)}
              placeholder={attr.placeholder || `Digite ${attr.label}...`}
            />
          );
        case 'number':
          return (
            <input 
              type="number"
              className={hasError ? styles.errorBorder : ''}
              value={value || ''}
              onChange={(e) => handleAttrChange(attr.id, e.target.value)}
              placeholder={attr.placeholder || `Digite ${attr.label}...`}
            />
          );
        case 'boolean':
        case 'select':
          return (
            <select 
              value={value || ''}
              className={hasError ? styles.errorBorder : ''}
              onChange={(e) => handleAttrChange(attr.id, e.target.value)}
            >
              <option value="">Selecione...</option>
              {attr.options && attr.options.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        case 'number_unit':
          const numVal = value ? value.value : '';
          const unitVal = value ? value.unit : (attr.defaultUnit || '');
          return (
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <input 
                type="number"
                className={hasError ? styles.errorBorder : ''}
                value={numVal || ''}
                onChange={(e) => handleNumUnitChange(attr.id, 'value', e.target.value)}
                placeholder="Valor"
                style={{ flex: 2, minWidth: 0 }}
              />
              <select 
                value={unitVal || ''}
                onChange={(e) => handleNumUnitChange(attr.id, 'unit', e.target.value)}
                style={{ flex: 1, minWidth: 0 }}
              >
                {attr.allowedUnits && attr.allowedUnits.map(unit => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          );
        case 'file':
          return (
            <input 
              type="file"
              className={hasError ? styles.errorBorder : ''}
              onChange={(e) => handleAttrChange(attr.id, e.target.files[0])}
            />
          );
        default:
          return (
            <input 
              type="text"
              className={hasError ? styles.errorBorder : ''}
              value={value || ''}
              onChange={(e) => handleAttrChange(attr.id, e.target.value)}
              placeholder={attr.placeholder || `Digite ${attr.label}...`}
            />
          );
      }
    };

    return (
      <div key={attr.id} className={styles.inputGroup}>
        <label>
          {attr.label}
          {attr.isRequired && <span className={styles.requiredAsterisk}> *</span>}
          {attr.placeholder && (
            <span style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help', color: '#94a3b8' }} title={attr.placeholder}>
              <Info size={14} style={{ marginLeft: '4px' }} />
            </span>
          )}
        </label>
        {renderInput()}
      </div>
    );
  };


  //#region Aba 1 - Dados do produto
  const [formData, setFormData] = useState({
    integracaoId: '',
    titulo: '',
    sku: '',
    categoria: '',
    categoriaML: '',
    preco: '',
    gtin: '',
    condicao: 'new',
    descricao: '',
    estoqueAtual: '',
    estoqueMinimo: '',
  });

  const retornarCategoriasInternas = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/categoria-produto`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if(!data.sucesso){
        setCategoriasInternas([]);
        throw new Error(data.message || "Erro ao retornar categorias internas");
      }

      setCategoriasInternas(data.categorias);
    } catch (error) {
      console.error("Falha ao retornar categorias internas: " + error);
      toast.error(error.message);
    }
  }

  const retornarIntegracoes = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/integracoes`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if(!data.sucesso){
        setIntegracoes([]);
        throw new Error(data.message || "Erro ao retornar integrações");
      }

      setIntegracoes(data.integracoes);
    } catch (error) {
      console.error("Falha ao retornar integrações: " + error);
      toast.error(error.message);
    }
  };

  const buscarSugestoesCategoria = async (integracaoId, titulo) => {
    if (!integracaoId || !titulo) return;
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/categoria-produto/mercado-livre/sugeridas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          integracaoId: Number(integracaoId),
          titulo: titulo
        })
      });
      
      const data = await response.json();
      if(data.sucesso) {
        setSugestoesCategoria(data.sugestoes);
        if (data.sugestoes.length > 0) {
            const suggestedCat = data.sugestoes[0].category_id;
            setFormData(prev => ({ ...prev, categoriaML: suggestedCat }));
            carregarAtributosCategoria(integracaoId, suggestedCat);
        } else {
            setFormData(prev => ({ ...prev, categoriaML: '' }));
            setMlAttributes([]);
            setMlAttributeValues({});
        }
      } else {
        setSugestoesCategoria([]);
        toast.error(data.message || "Erro ao buscar sugestões de categoria");
      }
    } catch (error) {
      console.error("Falha ao buscar sugestões: ", error);
      toast.error("Falha ao buscar sugestões de categoria.");
    }
  };
  //#endregion

  //#region Aba 2 - Caracteristicas
  const [characteristics, setCharacteristics] = useState({
    marca: '',
    modelo: '',
    cor: '',
    material: '',
  });
  //#endregion

  //#region Aba 3 - Imagens
  const [images, setImages] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      isHighlight: images.length === 0, // A primeira vira destaque automaticamente
    }));

    // Atualiza garantindo que só há um destaque
    let updatedImages = [...images, ...newImages];
    if (images.length === 0 && updatedImages.length > 0) {
        updatedImages[0].isHighlight = true;
    }
    
    setImages(updatedImages);
    e.target.value = null;
  };

  const handleDeleteImage = (id) => {
    const updatedImages = images.filter((img) => img.id !== id);
    // Se apagou a destaque, passa pra próxima
    if (images.find(img => img.id === id)?.isHighlight && updatedImages.length > 0) {
        updatedImages[0].isHighlight = true;
    }
    setImages(updatedImages);
  };

  const handleSetHighlight = (id) => {
    setImages(
      images.map((img) => ({
        ...img,
        isHighlight: img.id === id,
      }))
    );
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  //#endregion

  useEffect(() => {
    const carregarDadosProduto = async () => {
      setLoadingProduct(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/produto/${produtoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.sucesso && data.produto) {
          const prod = data.produto;
          
          const formatPreco = (val) => {
            if (val === undefined || val === null) return "";
            let stringVal = Number(val).toFixed(2).replace(".", ",");
            stringVal = stringVal.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
            stringVal = stringVal.replace(/(\d)(\d{3}),/g, "$1.$2,");
            return stringVal;
          };

          setFormData({
            integracaoId: prod.integracao_id || '',
            titulo: prod.nome || '',
            sku: prod.sku || '',
            categoria: prod.categoria_id || '',
            categoriaML: prod.ml_categoria_id || '',
            preco: formatPreco(prod.preco),
            gtin: prod.gtin || '',
            condicao: prod.condicao || 'new',
            descricao: prod.descricao || '',
            estoqueAtual: prod.estoque || 0,
            estoqueMinimo: prod.estoqueMinimo || 0,
          });

          const loadedImages = (prod.imagens || []).map(img => ({
            id: String(img.id),
            url: img.url_imagem.startsWith("http") ? img.url_imagem : `${API_BASE_URL}/${img.url_imagem}`,
            file: null,
            isHighlight: img.destaque === 1,
          }));
          setImages(loadedImages);

          let initialAttrValues = null;
          if (prod.caracteristicas) {
            try {
              const parsed = typeof prod.caracteristicas === 'string'
                ? JSON.parse(prod.caracteristicas)
                : prod.caracteristicas;
              
              if (Array.isArray(parsed)) {
                initialAttrValues = {};
                parsed.forEach(attr => {
                  if (attr.value_number !== undefined) {
                    initialAttrValues[attr.id] = {
                      value: attr.value_number,
                      unit: attr.value_unit_id || ''
                    };
                  } else if (attr.value_id !== undefined) {
                    initialAttrValues[attr.id] = attr.value_id;
                  } else if (attr.value_name !== undefined) {
                    initialAttrValues[attr.id] = attr.value_name;
                  }
                });
              }
            } catch (e) {
              console.error("Erro ao fazer parse das características:", e);
            }
          }

          if (prod.ml_categoria_id) {
            carregarAtributosCategoria(prod.integracao_id, prod.ml_categoria_id, initialAttrValues);
          }
        } else {
          toast.error("Erro ao carregar dados do produto.");
        }
      } catch (error) {
        console.error("Falha ao carregar produto:", error);
        toast.error("Falha ao carregar dados do produto.");
      } finally {
        setLoadingProduct(false);
      }
    };

    if (isOpen) {
      setIsSubmitting(false);
      retornarIntegracoes();
      retornarCategoriasInternas();
      setActiveTab(1);
      setFormData({
        integracaoId: '',
        titulo: '',
        sku: '',
        categoria: '',
        categoriaML: '',
        preco: '',
        gtin: '',
        condicao: 'new',
        descricao: '',
        estoqueAtual: '',
        estoqueMinimo: '',
      });
      setSugestoesCategoria([]);
      setCharacteristics({
        marca: '',
        modelo: '',
        cor: '',
        material: '',
      });
      setImages([]);
      setMlAttributes([]);
      setMlAttributeValues({});
      setShowOnlyRequired(true);
      setOpenGroups({});
      setErrors({});
      setShowWarningModal(false);

      if (produtoId) {
        carregarDadosProduto();
      } else {
        setLoadingProduct(false);
      }
    }
  }, [isOpen, produtoId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5,
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!isOpen) return null;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }

    if (name === 'preco') {
        // Mascara monetária simples (permite apenas numeros e virgula)
        let val = value.replace(/\D/g, '');
        val = (val / 100).toFixed(2) + '';
        val = val.replace(".", ",");
        val = val.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
        val = val.replace(/(\d)(\d{3}),/g, "$1.$2,");
        setFormData({ ...formData, [name]: val });
        return;
    }

    setFormData({ ...formData, [name]: value });

    if (name === 'integracaoId' && formData.titulo) {
      buscarSugestoesCategoria(value, formData.titulo);
    }

    if (name === 'categoriaML') {
      if (value) {
        carregarAtributosCategoria(formData.integracaoId, value);
      } else {
        setMlAttributes([]);
        setMlAttributeValues({});
      }
    }
  };

  const handleCharChange = (e) => {
    const { name, value } = e.target;
    setCharacteristics({ ...characteristics, [name]: value });
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.integracaoId) newErrors.integracaoId = true;
    if (!formData.titulo) newErrors.titulo = true;
    if (!formData.sku) newErrors.sku = true;
    if (!formData.preco) newErrors.preco = true;
    if (!formData.condicao) newErrors.condicao = true;
    if (!formData.categoria) newErrors.categoria = true;

    mlAttributes.forEach(attr => {
      let isRequired = attr.required;
      
      if (attr.id === 'EMPTY_GTIN_REASON') {
        const isGtinEmpty = !formData.gtin || formData.gtin.trim() === '';
        if (isGtinEmpty) isRequired = true;
      }
      if (attr.id === 'GRADING') {
        if (formData.condicao !== 'refurbished') isRequired = false;
      }

      if (isRequired) {
        const val = mlAttributeValues[attr.id];
        if (attr.fieldType === 'number_unit') {
          if (!val || val.value === undefined || val.value === null || val.value === '') {
            newErrors[`ml_attr_${attr.id}`] = true;
          }
        } else {
          if (val === undefined || val === null || val === '') {
            newErrors[`ml_attr_${attr.id}`] = true;
          }
        }
      }
    });

    return newErrors;
  };

  const compileAttributes = () => {
    const formattedAttributes = [];
    Object.entries(mlAttributeValues).forEach(([id, val]) => {
      if (val === undefined || val === null || val === '') return;
      const attr = mlAttributes.find(a => a.id === id);
      if (!attr) return;

      if (attr.fieldType === 'number_unit') {
        if (val.value !== undefined && val.value !== null && val.value !== '') {
          formattedAttributes.push({
            id: id,
            value_number: Number(val.value),
            value_unit_id: val.unit || attr.defaultUnit || (attr.allowedUnits && attr.allowedUnits[0])
          });
        }
      } else if (attr.fieldType === 'boolean' || attr.fieldType === 'select') {
        const optionExists = attr.options?.some(opt => opt.value === val);
        if (optionExists) {
          formattedAttributes.push({
            id: id,
            value_id: val
          });
        } else {
          formattedAttributes.push({
            id: id,
            value_name: String(val)
          });
        }
      } else if (attr.fieldType === 'number') {
        formattedAttributes.push({
          id: id,
          value_name: String(val)
        });
      } else {
        formattedAttributes.push({
          id: id,
          value_name: String(val)
        });
      }
    });
    return formattedAttributes;
  };

  const uploadImagesInBatch = async (token) => {
    const uploadedImages = [];
    for (let index = 0; index < images.length; index++) {
      const img = images[index];
      let url = img.url;

      if (img.file) {
        const formDataUpload = new FormData();
        formDataUpload.append("imagem", img.file);

        const uploadResponse = await fetch(`${API_BASE_URL}/produto/upload-imagem`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        });

        if (!uploadResponse.ok) {
          throw new Error(`Falha no upload da imagem ${img.file?.name || index + 1}`);
        }

        const uploadData = await uploadResponse.json();
        if (!uploadData.sucesso) {
          throw new Error(uploadData.error || uploadData.mensagem || "Erro no upload da imagem");
        }

        url = uploadData.caminho;
      } else {
        if (url.startsWith(`${API_BASE_URL}/`)) {
          url = url.substring(API_BASE_URL.length + 1);
        }
      }

      uploadedImages.push({
        url: url,
        ordem: index + 1,
        ehDestaque: img.isHighlight ? 1 : 0
      });
    }
    return uploadedImages;
  };

  const registerProduct = async (token, payload) => {
    const response = await fetch(`${API_BASE_URL}/produto`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.sucesso) {
      throw new Error(responseData.error || responseData.mensagem || "Falha ao cadastrar o produto");
    }

    return responseData;
  };

  const updateProduct = async (token, payload) => {
    const response = await fetch(`${API_BASE_URL}/produto/${produtoId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.sucesso) {
      throw new Error(responseData.error || responseData.mensagem || "Falha ao atualizar o produto");
    }

    return responseData;
  };

  const handleSave = async () => {
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowWarningModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");

      // Passo 1: Upload em Lote das Imagens
      const uploadedImages = await uploadImagesInBatch(token);

      // Passo 2: Cadastro / Edição do Produto
      const caracteristicas = compileAttributes();
      
      if (produtoId) {
        const payload = {
          nome: formData.titulo,
          sku: formData.sku,
          preco: parseFloat(formData.preco.replace(/\./g, '').replace(',', '.')),
          descricao: formData.descricao,
          condicao: formData.condicao,
          categoria_id: parseInt(formData.categoria, 10),
          caracteristicas: caracteristicas,
          gtin: formData.gtin,
          quantidade_minima: formData.estoqueMinimo ? parseInt(formData.estoqueMinimo, 10) : 0,
          imagens: uploadedImages
        };

        await updateProduct(token, payload);
        toast.success("Produto atualizado com sucesso!");
      } else {
        const payload = {
          nome: formData.titulo,
          sku: formData.sku,
          preco: parseFloat(formData.preco.replace(/\./g, '').replace(',', '.')),
          descricao: formData.descricao,
          condicao: formData.condicao,
          categoria_id: parseInt(formData.categoria, 10),
          caracteristicas: caracteristicas,
          gtin: formData.gtin,
          integracao_id: parseInt(formData.integracaoId, 10),
          quantidade_inicial: formData.estoqueAtual ? parseInt(formData.estoqueAtual, 10) : 0,
          quantidade_minima: formData.estoqueMinimo ? parseInt(formData.estoqueMinimo, 10) : 0,
          categoria_ml: formData.categoriaML,
          imagens: uploadedImages
        };

        await registerProduct(token, payload);
        toast.success("Produto cadastrado com sucesso!");
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      }
      onClose();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error(error.message || "Erro ao realizar o salvamento do produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      {showWarningModal && (
        <div className={styles.warningModalOverlay}>
          <div className={styles.warningModal}>
            <div className={styles.warningHeader}>
              <Info color="#ef4444" size={24} />
              <h3>Atenção</h3>
            </div>
            <p>Por favor, preencha todos os campos obrigatórios antes de salvar o produto.</p>
            <button onClick={() => setShowWarningModal(false)} className={styles.btnWarningOk}>
              Entendi
            </button>
          </div>
        </div>
      )}
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h2>{produtoId ? "Editar Produto" : "Cadastrar Novo Produto"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabBtn} ${activeTab === 1 ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(1)}
          >
            Dados do Produto
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 2 ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(2)}
          >
            Características
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 3 ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(3)}
          >
            Imagens
          </button>
        </div>

        <div className={styles.modalBody}>
          {loadingProduct ? (
            <div className={styles.loadingContainer} style={{ minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <div className={styles.spinner}></div>
              <p style={{ color: '#64748b' }}>Carregando dados do produto...</p>
            </div>
          ) : (
            <>
              {activeTab === 1 && (
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>Integração</label>
                    <select name="integracaoId" value={formData.integracaoId} onChange={handleFormChange} className={errors.integracaoId ? styles.errorBorder : ''} disabled={!!produtoId}>
                      <option value="">Selecione uma integração...</option>
                      {integracoes.map((int) => (
                        <option key={int.id} value={int.id}>{int.nome}</option>
                      ))}
                    </select>
                  </div>
              <div className={styles.inputGroup}>
                <label>Título do Anúncio</label>
                <input 
                  type="text" 
                  name="titulo" 
                  className={errors.titulo ? styles.errorBorder : ''}
                  value={formData.titulo} 
                  onChange={handleFormChange} 
                  onBlur={() => buscarSugestoesCategoria(formData.integracaoId, formData.titulo)}
                  placeholder="Ex: Teclado Mecânico Gamer" 
                />
              </div>
              <div className={styles.inputGroup}>
                <label>SKU</label>
                <input type="text" name="sku" className={errors.sku ? styles.errorBorder : ''} value={formData.sku} onChange={handleFormChange} placeholder="Ex: TEC-GAMER-01" />
              </div>
              <div className={styles.inputGroup}>
                <label>Categoria Interna</label>
                <select name="categoria" value={formData.categoria} onChange={handleFormChange} className={errors.categoria ? styles.errorBorder : ''}>
                  <option value="">Selecione uma categoria interna...</option>
                  {categoriasInternas.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Condição</label>
                <select name="condicao" value={formData.condicao} onChange={handleFormChange} className={errors.condicao ? styles.errorBorder : ''}>
                  <option value="new">Novo</option>
                  <option value="used">Usado</option>
                  <option value="refurbished">Recondicionado</option>
                  <option value="not_specified">Não Especificado</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label>Preço de Venda (R$)</label>
                <input type="text" name="preco" className={errors.preco ? styles.errorBorder : ''} value={formData.preco} onChange={handleFormChange} placeholder="0,00" />
              </div>
              <div className={styles.inputGroup}>
                <label>GTIN / EAN</label>
                <input type="text" name="gtin" value={formData.gtin} onChange={handleFormChange} placeholder="Apenas números" pattern="\d*" />
              </div>
              <div className={styles.inputGroup}>
                <label>Estoque Atual</label>
                <input type="number" name="estoqueAtual" value={formData.estoqueAtual} onChange={handleFormChange} min="0" disabled={!!produtoId} />
              </div>
              <div className={styles.inputGroup}>
                <label>Estoque Mínimo</label>
                <input type="number" name="estoqueMinimo" value={formData.estoqueMinimo} onChange={handleFormChange} min="0" />
              </div>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Descrição do Produto</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleFormChange} placeholder="Detalhes do produto..."></textarea>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className={styles.formGrid}>
              <p className={styles.fullWidth} style={{ color: '#64748b', fontSize: '0.95rem' }}>
                Preencha os atributos abaixo para melhorar o ranqueamento do seu anúncio no Mercado Livre. Campos gerados dinamicamente com base na categoria.
              </p>
              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  Categoria Mercado Livre
                  <Info size={16} title="Esta é a categoria à qual o produto será vinculado ao ser anunciado no Mercado Livre. Seu conteúdo é sugerido com base no Título digitado para o produto." style={{cursor: 'help'}} />
                </label>
                <select name="categoriaML" value={formData.categoriaML} onChange={handleFormChange} disabled={!!produtoId}>
                  {produtoId ? (
                    <option value={formData.categoriaML}>{formData.categoriaML}</option>
                  ) : (
                    <>
                      <option value="">Selecione a categoria do Mercado Livre...</option>
                      {sugestoesCategoria.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {cat.category_name} ({cat.domain_name})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
              
              {formData.categoriaML && (
                <>
                  {loadingAttributes ? (
                    <div className={styles.loadingContainer} style={{ gridColumn: 'span 2' }}>
                      <div className={styles.spinner}></div>
                      <p>Carregando atributos da categoria...</p>
                    </div>
                  ) : mlAttributes.length > 0 ? (
                    <>
                      {/* Switch de Filtro de Atributos */}
                      <div className={styles.filterSwitchContainer}>
                        <span>Exibir apenas campos obrigatórios</span>
                        <label className={styles.switch}>
                          <input 
                            type="checkbox" 
                            checked={showOnlyRequired} 
                            onChange={(e) => setShowOnlyRequired(e.target.checked)} 
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>

                      {/* Accordions Agrupados */}
                      {(() => {
                        const grouped = getGroupedAttributes();
                        const groupKeys = Object.keys(grouped);
                        
                        if (groupKeys.length === 0) {
                          return (
                            <p className={styles.fullWidth} style={{ color: '#64748b', textAlign: 'center', margin: '20px 0' }}>
                              Nenhum atributo {showOnlyRequired ? 'obrigatório' : ''} encontrado para esta categoria.
                            </p>
                          );
                        }

                        return groupKeys.map(groupId => {
                          const group = grouped[groupId];
                          const isOpen = !!openGroups[groupId];
                          
                          return (
                            <div key={groupId} className={`${styles.accordion} ${!isOpen ? styles.closed : ''}`}>
                              <div className={styles.accordionHeader} onClick={() => toggleGroup(groupId)}>
                                <span>{group.label} ({group.items.length})</span>
                                <span className={styles.accordionIcon}>
                                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </span>
                              </div>
                              {isOpen && (
                                <div className={styles.accordionContent}>
                                  {group.items.map(attr => renderAttributeField(attr))}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </>
                  ) : (
                    <p className={styles.fullWidth} style={{ color: '#64748b', textAlign: 'center', margin: '20px 0' }}>
                      Nenhum atributo encontrado para esta categoria.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div>
              <label className={styles.uploadContainer}>
                <UploadCloud size={48} className={styles.uploadIcon} />
                <div className={styles.uploadText}>
                  Arraste e solte imagens aqui ou <span>clique para selecionar</span>
                </div>
                <input
                  type="file"
                  className={styles.hiddenInput}
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>

              {images.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
                    <div className={styles.imagesGrid}>
                      {images.map((img) => (
                        <SortableImage
                          key={img.id}
                          image={img}
                          onDelete={handleDeleteImage}
                          onHighlight={handleSetHighlight}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
          </>
        )}
      </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className={styles.btnSubmit} onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting
              ? (produtoId ? "Salvando..." : "Cadastrando...")
              : (produtoId ? "Salvar Alterações" : "Cadastrar Produto")}
          </button>
        </div>
      </div>
    </div>
  );
}
