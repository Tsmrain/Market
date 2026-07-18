package com.mutualista.mercado.domain.repository;
import com.mutualista.mercado.domain.Producto;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductoRepository extends CrudRepository<Producto, Long>, PagingAndSortingRepository<Producto, Long> {
    
    // Filtros para la vista pública: Solo productos Activos de comerciantes Habilitados
    @Query("SELECT p FROM Comerciante c JOIN c.catalogo p WHERE c.cuentaHabilitada = true AND c.eliminado = false AND p.eliminado = false")
    Page<Producto> findByEliminadoFalse(Pageable pageable);
    
    @Query("SELECT p FROM Comerciante c JOIN c.catalogo p WHERE c.cuentaHabilitada = true AND c.eliminado = false AND (LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND p.eliminado = false")
    Page<Producto> findByNombreContainingIgnoreCaseAndEliminadoFalse(@Param("nombre") String nombre, Pageable pageable);

    @Query("SELECT p FROM Comerciante c JOIN c.catalogo p WHERE c.cuentaHabilitada = true AND c.eliminado = false AND (p.categoria.id = :idCategoria OR p.categoria.categoriaPadre.id = :idCategoria) AND p.eliminado = false")
    Page<Producto> findByCategoriaJerarquia(@Param("idCategoria") Long idCategoria, Pageable pageable);

    @Query("SELECT p FROM Comerciante c JOIN c.catalogo p WHERE c.cuentaHabilitada = true AND c.eliminado = false AND (LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND (p.categoria.id = :idCategoria OR p.categoria.categoriaPadre.id = :idCategoria) AND p.eliminado = false")
    Page<Producto> findByNombreAndCategoriaJerarquia(@Param("nombre") String nombre, @Param("idCategoria") Long idCategoria, Pageable pageable);

    // Consulta para el Panel del Comerciante: Muestra todos sus productos que NO estén eliminados (incluso los no disponibles)
    @Query("SELECT p FROM Comerciante c JOIN c.catalogo p WHERE c.id = :idComerciante AND p.eliminado = false")
    List<Producto> findByComercianteIdAndEliminadoFalse(@Param("idComerciante") Long idComerciante);

    long countByEliminadoFalse();

    // NUEVO: Agregación para Gráficos (Information Expert)
    @Query("SELECT p.categoria.nombre, COUNT(p) FROM Producto p WHERE p.eliminado = false GROUP BY p.categoria.nombre")
    List<Object[]> countProductosPorCategoria();
}
