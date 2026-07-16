package com.mutualista.mercado.repository;
import com.mutualista.mercado.domain.Categoria;


import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import java.util.List;

public interface CategoriaRepository extends CrudRepository<Categoria, Long> {
    List<Categoria> findAll();
    
    // Lista para el Administrador (Solo las que no están eliminadas lógicamente)
    List<Categoria> findByEliminadoFalse();

    // Pure Fabrication: Vista Pública
    @Query("SELECT DISTINCT c FROM Categoria c WHERE c.eliminado = false AND EXISTS (SELECT p FROM Producto p WHERE (p.categoria = c OR p.categoria.categoriaPadre = c) AND p.eliminado = false)")
    List<Categoria> findCategoriasConProductosActivos();
}
