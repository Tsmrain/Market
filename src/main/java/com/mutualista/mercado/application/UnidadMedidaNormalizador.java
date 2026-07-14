package com.mutualista.mercado.application;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service // Patrón Pure Fabrication para Data Cleansing y Entity Matching básico
public class UnidadMedidaNormalizador {
    
    private final Map<String, String> diccionario = new HashMap<>();

    public UnidadMedidaNormalizador() {
        // Familia Kilos
        diccionario.put("KILOS", "KG");
        diccionario.put("KILO", "KG");
        diccionario.put("KILOGRAMO", "KG");
        diccionario.put("KILOGRAMOS", "KG");
        
        // Familia Unidades
        diccionario.put("UNIDADES", "UNIDAD");
        diccionario.put("PIEZA", "UNIDAD");
        diccionario.put("PIEZAS", "UNIDAD");
        
        // Familia Amarro (Manejo predictivo de Typo / Distancia de Edición manual)
        diccionario.put("AMARRO", "AMARRO");
        diccionario.put("AMARO", "AMARRO"); // Corrección del typo
        diccionario.put("AMARROS", "AMARRO");
        diccionario.put("AMARITO", "AMARRO");
        
        // Familia Docenas y Cajas
        diccionario.put("DOCENAS", "DOCENA");
        diccionario.put("CAJAS", "CAJA");
        diccionario.put("CAJON", "CAJA");
        
        // Familia Gramos
        diccionario.put("GRAMOS", "GRAMO");
        diccionario.put("GR", "GRAMO");
    }

    public String normalizar(String entrada) {
        if (entrada == null || entrada.trim().isEmpty()) {
            return "UNIDAD"; 
        }
        // Limpieza básica (Quitar espacios extra y pasar a mayúsculas)
        String limpia = entrada.trim().toUpperCase().replaceAll("\\s+", " ");
        
        // Si escribe algo totalmente nuevo como "RACIMO", devolverá "RACIMO".
        return diccionario.getOrDefault(limpia, limpia);
    }
}
