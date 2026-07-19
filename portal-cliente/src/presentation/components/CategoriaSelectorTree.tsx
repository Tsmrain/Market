import React, { useMemo } from 'react';
import type { CategoriaInfo } from '../../domain/models';

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface CategoriaNode extends CategoriaInfo {
    subcategorias: CategoriaNode[];
}

// ─── Props (misma interfaz que antes para no romper importaciones) ────────────

interface CategoriaSelectorTreeProps {
    categorias: CategoriaInfo[];
    /** ID de la categoría actualmente seleccionada (la más profunda) */
    idCategoriaSeleccionada: string;
    /** Callback con el ID del nodo hoja seleccionado */
    onSelect: (id: string) => void;
}

// ─── Pure Fabrication: construir árbol desde lista plana ─────────────────────

function buildTree(flat: CategoriaInfo[]): CategoriaNode[] {
    const map = new Map<number, CategoriaNode>();
    const roots: CategoriaNode[] = [];

    flat.forEach(cat => {
        map.set(cat.id, { ...cat, subcategorias: [] });
    });

    flat.forEach(cat => {
        const node = map.get(cat.id)!;
        if (cat.idCategoriaPadre != null) {
            const parent = map.get(cat.idCategoriaPadre);
            if (parent) parent.subcategorias.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

/**
 * Dado el árbol y la ruta de IDs seleccionados, devuelve la lista de niveles
 * a renderizar como <select>. Cada nivel es un array de CategoriaNode que
 * corresponde a los hijos del nodo padre seleccionado en el nivel anterior.
 *
 * El primer nivel siempre son los nodos raíz.
 * Si el nodo seleccionado en el nivel N tiene hijos, aparece un nivel N+1.
 *
 * @param roots     - Nodos raíz del árbol
 * @param ruta      - Array de IDs seleccionados por el usuario (uno por nivel)
 */
function calcularNiveles(roots: CategoriaNode[], ruta: number[]): CategoriaNode[][] {
    const niveles: CategoriaNode[][] = [roots];
    let nivelesActual = roots;

    for (const idSeleccionado of ruta) {
        const nodoSeleccionado = nivelesActual.find(n => n.id === idSeleccionado);
        if (!nodoSeleccionado || nodoSeleccionado.subcategorias.length === 0) break;
        niveles.push(nodoSeleccionado.subcategorias);
        nivelesActual = nodoSeleccionado.subcategorias;
    }

    return niveles;
}

/**
 * Reconstruye la ruta de IDs desde la raíz hasta el nodo con el ID dado.
 * Necesario para pre-seleccionar los selects al cargar un producto existente.
 */
function reconstruirRuta(flat: CategoriaInfo[], idObjetivo: number): number[] {
    const mapa = new Map<number, CategoriaInfo>();
    flat.forEach(c => mapa.set(c.id, c));

    const ruta: number[] = [];
    let actual = mapa.get(idObjetivo);
    while (actual) {
        ruta.unshift(actual.id);
        actual = actual.idCategoriaPadre != null ? mapa.get(actual.idCategoriaPadre) : undefined;
    }
    return ruta;
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export const CategoriaSelectorTree: React.FC<CategoriaSelectorTreeProps> = ({
    categorias,
    idCategoriaSeleccionada,
    onSelect,
}) => {
    // Árbol construido en memoria (memo para no recalcular en cada render)
    const roots = useMemo(() => buildTree(categorias), [categorias]);

    // Ruta de IDs seleccionados: [idNivel0, idNivel1, ..., idHoja]
    // Se deriva del idCategoriaSeleccionada cuando cambia desde fuera (carga inicial)
    const rutaInicial = useMemo(() => {
        if (!idCategoriaSeleccionada || categorias.length === 0) return [];
        const idNum = parseInt(idCategoriaSeleccionada, 10);
        return isNaN(idNum) ? [] : reconstruirRuta(categorias, idNum);
    }, [idCategoriaSeleccionada, categorias]);

    // Estado local: ruta de selección del usuario
    const [ruta, setRuta] = React.useState<number[]>(rutaInicial);

    // Sincronizar ruta si la selección externa cambia (ej. carga de producto)
    React.useEffect(() => {
        setRuta(rutaInicial);
    }, [idCategoriaSeleccionada]);

    // Niveles a renderizar como selects
    const niveles = useMemo(() => calcularNiveles(roots, ruta), [roots, ruta]);

    // Manejar cambio en el select del nivel `nivelIdx`
    const handleChange = (nivelIdx: number, idElegido: string) => {
        if (!idElegido) {
            // El usuario volvió al placeholder — truncar ruta desde este nivel
            const nuevaRuta = ruta.slice(0, nivelIdx);
            setRuta(nuevaRuta);
            // El ID que se enviará al backend es el último elemento de la ruta padre
            onSelect(nuevaRuta.length > 0 ? nuevaRuta[nuevaRuta.length - 1].toString() : '');
            return;
        }

        const idNum = parseInt(idElegido, 10);
        // Reemplazar desde este nivel en adelante
        const nuevaRuta = [...ruta.slice(0, nivelIdx), idNum];
        setRuta(nuevaRuta);

        // El ID a enviar al backend es siempre el nodo más profundo seleccionado
        onSelect(idElegido);
    };

    const selectStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        fontSize: '0.9rem',
        background: '#ffffff',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    };

    const nivelLabels = ['Categoría Principal', 'Subcategoría', 'Tipo', 'Subtipo'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {niveles.map((opcionesNivel, nivelIdx) => {
                const idSeleccionadoEnNivel = ruta[nivelIdx];
                const label = nivelLabels[nivelIdx] ?? `Nivel ${nivelIdx + 1}`;
                const selectId = `categoria-nivel-${nivelIdx}`;

                return (
                    <div key={nivelIdx}>
                        <label htmlFor={selectId} style={labelStyle}>
                            {label} *
                        </label>
                        <select
                            id={selectId}
                            value={idSeleccionadoEnNivel?.toString() ?? ''}
                            onChange={e => handleChange(nivelIdx, e.target.value)}
                            style={{
                                ...selectStyle,
                                borderColor: !idSeleccionadoEnNivel ? 'var(--border-color)' : 'var(--primary-color, #2563eb)',
                            }}
                        >
                            <option value="">
                                {nivelIdx === 0
                                    ? '— Seleccione una categoría —'
                                    : `— Seleccione ${label.toLowerCase()} —`}
                            </option>
                            {opcionesNivel.map(nodo => (
                                <option key={nodo.id} value={nodo.id}>
                                    {nodo.nombre}
                                    {nodo.subcategorias.length > 0 ? ' ▸' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            })}

            {/* Indicador visual de categoría final seleccionada */}
            {idCategoriaSeleccionada && (
                <div style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                    <span>
                        Seleccionado: <strong style={{ color: 'var(--text-primary)' }}>
                            {categorias.find(c => c.id.toString() === idCategoriaSeleccionada)?.nombre ?? '—'}
                        </strong>
                    </span>
                </div>
            )}
        </div>
    );
};
