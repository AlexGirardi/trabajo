import type { Material } from '../types';
import { loadArray, saveArray, generateId, updateById, removeById, clearCache } from './storageUtils';

const USE_API = (import.meta as any).env?.VITE_USE_API === 'true';
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000/api';

// Polyfill for Promise.withResolvers (not available in Node.js 18)
declare global {
  interface PromiseConstructor {
    withResolvers<T>(): {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: any) => void;
    };
  }
}

if (!(Promise as any).withResolvers) {
  (Promise as any).withResolvers = function<T>() {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return { promise, resolve: resolve!, reject: reject! };
  };
}

const MATERIALS_STORAGE_KEY = 'estudia_materials';

export class MaterialService {  // Obtener todos los materiales
  static getMaterials(): Material[] {
    return loadArray<Material>(MATERIALS_STORAGE_KEY, { dateFields: ['fechaSubida'] });
  }

  static async fetchMaterials(): Promise<Material[]> {
    if (!USE_API) return Promise.resolve(this.getMaterials());
    const res = await fetch(`${API_BASE}/materials`);
    if (!res.ok) throw new Error('Error fetching materials');
    const data = await res.json();
    saveArray(MATERIALS_STORAGE_KEY, data);
    return data.map((m: any) => ({ ...m, fechaSubida: new Date(m.fechaSubida) }));
  }

  // Obtener materiales por curso
  static getMaterialsByCourse(cursoId: string): Material[] {
    return this.getMaterials().filter(material => material.cursoId === cursoId);
  }

  // Obtener un material por ID
  static getMaterialById(id: string): Material | undefined {
    return this.getMaterials().find(material => material.id === id);
  }
  // Guardar un nuevo material
  static saveMaterial(materialData: Omit<Material, 'id' | 'fechaSubida'>): Material {
    // Si no usamos API mantenemos comportamiento previo
    if (!USE_API) {
      const list = this.getMaterials();
      const newMaterial: Material = { id: generateId(), fechaSubida: new Date(), activo: true, ...materialData };
      saveArray(MATERIALS_STORAGE_KEY, [...list, newMaterial]);
      return newMaterial;
    }

    // Modo API: intentamos crear en servidor primero para usar su ID persistente
    const minimalPayload = {
      cursoId: (materialData as any).cursoId,
      nombre: (materialData as any).nombre,
      tipo: (materialData as any).tipo,
      contenido: (materialData as any).contenido,
      tamaño: (materialData as any).tamaño,
      activo: (materialData as any).activo !== false,
    };

    // Optimistic phantom (en caso de fallo remoto mantendremos uno local)
    const phantom: Material = { id: generateId(), fechaSubida: new Date(), activo: true, ...(materialData as any) };
    const list = this.getMaterials();
    saveArray(MATERIALS_STORAGE_KEY, [...list, phantom]);

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/materials`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(minimalPayload) });
        if (!res.ok) throw new Error('remote create failed');
        const serverObj = await res.json();
        // Reconciliar: reemplazar phantom por el objeto real (id/fechaSubida del servidor)
        const current = this.getMaterials().filter(m => m.id !== phantom.id);
        const merged: Material = {
          ...phantom,
          ...serverObj,
          fechaSubida: new Date(serverObj.fechaSubida || new Date())
        };
        saveArray(MATERIALS_STORAGE_KEY, [...current, merged]);
      } catch {
        // Silencioso: dejamos phantom (local-only) hasta próxima sincronización fetchMaterials
      }
    })();

    return phantom;
  }// Procesar archivo y extraer contenido
  static async processFile(file: File): Promise<{ 
    contenido: string; 
    tamaño: number; 
    nombre: string;
    tipo: 'pdf' | 'texto' | 'documento';
    nombreOriginal?: string;
    tipoOriginal?: string;
    fueConvertido?: boolean;
  }> {
    const tamaño = file.size;
    
    console.log(`Procesando archivo: ${file.name}, tipo: ${file.type}, tamaño: ${tamaño} bytes`);
    
    // Archivos de texto (.txt)
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const contenido = await file.text();
      console.log(`Contenido extraído de archivo de texto (${contenido.length} caracteres):`, contenido.substring(0, 200) + '...');
      return { 
        contenido, 
        tamaño, 
        nombre: file.name,
        tipo: 'texto'
      };
    }

    // Archivos Markdown (.md)
    if (file.name.endsWith('.md') || file.type.includes('markdown')) {
      const contenido = await file.text();
      console.log(`Contenido extraído de archivo Markdown (${contenido.length} caracteres):`, contenido.substring(0, 200) + '...');
      return { 
        contenido, 
        tamaño, 
        nombre: file.name,
        tipo: 'documento'
      };
    }

    // Archivos PDF - convertir a texto
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        const contenido = await this.extractPDFText(file);
        console.log(`Contenido extraído de PDF (${contenido.length} caracteres):`, contenido.substring(0, 200) + '...');
        
        // Cambiar la extensión del nombre de .pdf a .txt
        const nombreConvertido = file.name.replace(/\.pdf$/i, '.txt');
        
        return { 
          contenido, 
          tamaño, 
          nombre: nombreConvertido, // Nuevo nombre con extensión .txt
          tipo: 'texto', // Tipo cambiado a texto
          nombreOriginal: file.name, // Preservar nombre original
          tipoOriginal: 'application/pdf', // Preservar tipo original
          fueConvertido: true // Marcar como convertido
        };
      } catch (error) {
        console.error('Error extrayendo texto de PDF:', error);
        
        throw new Error(`No se pudo extraer texto del PDF "${file.name}". 
        
SOLUCIONES:
1. Convierte el PDF a formato TXT manualmente y súbelo de nuevo
2. Copia y pega el contenido en un archivo de texto (.txt)
3. Asegúrate de que el PDF contiene texto seleccionable (no solo imágenes)

Error técnico: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    // Otros archivos de texto
    if (file.type.includes('text/')) {
      const contenido = await file.text();
      console.log(`Contenido extraído de archivo de texto (${contenido.length} caracteres):`, contenido.substring(0, 200) + '...');
      return { 
        contenido, 
        tamaño, 
        nombre: file.name,
        tipo: 'texto'
      };
    }

    // Para otros tipos de archivo
    throw new Error(`Tipo de archivo no soportado: ${file.type}. Formatos soportados: PDF, TXT, MD`);
  }  static async extractPDFText(file: File): Promise<string> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const arrayBuffer = await file.arrayBuffer();
      let pdf: any;

      const workerConfigs = [
        { workerSrc: '/pdf.worker.min.mjs', description: 'Worker local' },
        { workerSrc: '', description: 'Sin worker' },
        { workerSrc: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`, description: 'unpkg CDN' },
        { workerSrc: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`, description: 'jsDelivr CDN' }
      ];

      for (let i = 0; i < workerConfigs.length; i++) {
        const config = workerConfigs[i];
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = config.workerSrc;

          const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            verbosity: 0
          });

          pdf = await Promise.race([
            loadingTask.promise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout - 8 segundos')), 8000)
            )
          ]);

          break;
        } catch (error) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = '';

          if (i === workerConfigs.length - 1) {
            throw new Error(`Todos los métodos fallaron. Último error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }
      }

      if (!pdf) {
        throw new Error('No se pudo cargar el PDF con ningún método');
      }

      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim();

        if (pageText) {
          fullText += `\n--- Página ${pageNum} ---\n${pageText}\n`;
        }
      }

      const finalText = fullText.trim();

      if (finalText.length === 0) {
        throw new Error('El PDF no contiene texto extraíble (puede ser un PDF de imágenes)');
      }

      return finalText;
    } catch (error) {
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      throw new Error(`No se pudo extraer texto del PDF: ${errorMessage}`);
    }
  }

  // Actualizar un material existente
  static updateMaterial(id: string, updates: Partial<Material>): Material | null {
    const list = this.getMaterials();
    const { updated, list: next } = updateById(list, id, updates);
    if (!updated) return null;
    saveArray(MATERIALS_STORAGE_KEY, next);
    if (USE_API) {
      (async () => { try { await fetch(`${API_BASE}/materials/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); } catch {} })();
    }
    return updated;
  }

  // Eliminar un material
  static deleteMaterial(id: string): boolean {
    const list = this.getMaterials();
    const { removed, list: next } = removeById(list, id);
    if (!removed) return false;
    saveArray(MATERIALS_STORAGE_KEY, next);
    if (USE_API) {
      (async () => { try { await fetch(`${API_BASE}/materials/${id}`, { method: 'DELETE' }); } catch {} })();
    }
    return true;
  }

  // Eliminar todos los materiales de un curso
  static deleteMaterialsByCourse(cursoId: string): void {
    const list = this.getMaterials();
    const next = list.filter(m => m.cursoId !== cursoId);
    saveArray(MATERIALS_STORAGE_KEY, next);
    if (USE_API) {
      (async () => { try { await fetch(`${API_BASE}/materials?cursoId=${encodeURIComponent(cursoId)}`, { method: 'DELETE' }); } catch {} })();
    }
  }

  // Activar/Desactivar un material
  static toggleMaterialActive(id: string): Material | null {
    const material = this.getMaterialById(id);
    if (!material) return null;
    
    const newActiveState = !material.activo;
    const updated = this.updateMaterial(id, { activo: newActiveState });
    if (updated && USE_API) {
      (async () => { try { await fetch(`${API_BASE}/materials/${id}/active`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: newActiveState }) }); } catch (e) { /* silent */ } })();
    }
    return updated;
  }

  // Activar un material
  static activateMaterial(id: string): boolean {
    return this.updateMaterial(id, { activo: true }) !== null;
  }

  // Desactivar un material
  static deactivateMaterial(id: string): boolean {
    return this.updateMaterial(id, { activo: false }) !== null;
  }  // Obtener contenido de todos los materiales de un curso (para IA)
  static getCourseContent(cursoId: string): string {
    const allMaterials = this.getMaterialsByCourse(cursoId);
    // Solo incluir materiales activos
    const materials = allMaterials.filter(material => material.activo !== false);
    
    console.log(`Obteniendo contenido para curso ${cursoId}:`, {
      materialesTotal: allMaterials.length,
      materialesActivos: materials.length,
      materiales: materials.map(m => ({
        id: m.id,
        nombre: m.nombre,
        nombreOriginal: m.nombreOriginal,
        tipo: m.tipo,
        tipoOriginal: m.tipoOriginal,
        fueConvertido: m.fueConvertido,
        activo: m.activo,
        longitudContenido: m.contenido.length
      }))
    });
    
    const convertedCount = materials.filter(m => m.fueConvertido).length;
    if (convertedCount > 0) {
      console.log(`📄 ${convertedCount} materiales fueron convertidos de PDF a texto`);
    }
    
    if (materials.length === 0) {
      console.log('No se encontraron materiales para este curso');
      return '';
    }

    const content = materials
      .map(material => {
        const header = material.fueConvertido 
          ? `=== ${material.nombre} (${material.tipo}, convertido de PDF) ===`
          : `=== ${material.nombre} (${material.tipo}) ===`;
        return `${header}\n${material.contenido}`;
      })
      .join('\n\n');
      
    console.log(`Contenido total generado: ${content.length} caracteres`);
    
    return content;
  }

  // Guardar array de materiales en localStorage
  // saveMaterials / generateId reemplazados

  // Limpiar todos los materiales
  static clearAllMaterials(): void {
    localStorage.removeItem(MATERIALS_STORAGE_KEY);
    clearCache(MATERIALS_STORAGE_KEY);
  }
  // Estadísticas de materiales
  static getMaterialStats(cursoId?: string) {
    const materials = cursoId 
      ? this.getMaterialsByCourse(cursoId)
      : this.getMaterials();
    
    const totalMaterials = materials.length;
    const totalSize = materials.reduce((sum, material) => sum + material.tamaño, 0);
    const materialsByType = materials.reduce((acc, material) => {
      acc[material.tipo] = (acc[material.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Contar materiales convertidos de PDF
    const convertedMaterials = materials.filter(material => material.fueConvertido).length;
    const conversionDetails = materials
      .filter(material => material.fueConvertido)
      .map(material => ({
        id: material.id,
        nombre: material.nombre,
        nombreOriginal: material.nombreOriginal,
        tipoOriginal: material.tipoOriginal
      }));

    return {
      totalMaterials,
      totalSize,
      materialsByType,
      convertedMaterials,
      conversionDetails,
    };
  }
}

export const materialService = MaterialService;
