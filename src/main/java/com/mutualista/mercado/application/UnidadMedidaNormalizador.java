package com.mutualista.mercado.application;
import com.mutualista.mercado.domain.UnidadMedidaMaestra;
import com.mutualista.mercado.repository.UnidadMedidaMaestraRepository;


import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service // Patrón Pure Fabrication para Data Cleansing y Entity Matching básico
public class UnidadMedidaNormalizador {
    
    private final UnidadMedidaMaestraRepository unidadRepo;
    private final Map<String, String> diccionario = new HashMap<>();

    public UnidadMedidaNormalizador(UnidadMedidaMaestraRepository unidadRepo) {
        this.unidadRepo = unidadRepo;

        // Diccionario de Sinónimos y Correcciones (Gobernanza de Datos)
        diccionario.put("KILOS", "KG");
        diccionario.put("KILO", "KG");
        diccionario.put("KILOGRAMO", "KG");
        diccionario.put("KILOGRAMOS", "KG");
        
        diccionario.put("UNIDADES", "UNIDAD");
        diccionario.put("PIEZA", "UNIDAD");
        diccionario.put("PIEZAS", "UNIDAD");
        
        diccionario.put("AMARRO", "AMARRO");
        diccionario.put("AMARO", "AMARRO");
        diccionario.put("AMARROS", "AMARRO");
        diccionario.put("AMARITO", "AMARRO");
        
        diccionario.put("DOCENAS", "DOCENA");
        diccionario.put("CAJAS", "CAJA");
        diccionario.put("CAJON", "CAJA");
        
        diccionario.put("GRAMOS", "GRAMO");
        diccionario.put("GR", "GRAMO");
    }

    public String normalizar(String entrada) {
        if (entrada == null || entrada.trim().isEmpty()) {
            return "UNIDAD"; 
        }
        
        // Limpieza básica (Quitar espacios extra y pasar a mayúsculas)
        String limpia = entrada.trim().toUpperCase().replaceAll("\\s+", " ");
        
        // 1. Buscar coincidencia exacta en la base de datos de Unidades Maestras
        Optional<UnidadMedidaMaestra> exacta = unidadRepo.findByCodigo(limpia);
        if (exacta.isPresent()) {
            return exacta.get().getCodigo();
        }

        // 2. Si no coincide directamente, buscar en el diccionario de sinónimos/corrección de typos
        String sinonimo = diccionario.get(limpia);
        if (sinonimo != null) {
            Optional<UnidadMedidaMaestra> exactaSinonimo = unidadRepo.findByCodigo(sinonimo);
            if (exactaSinonimo.isPresent()) {
                return exactaSinonimo.get().getCodigo();
            }
            return sinonimo;
        }
        
        // 3. Si no existe en la base de datos ni en el diccionario, devolver limpio para no bloquear ventas
        return limpia;
    }
}
