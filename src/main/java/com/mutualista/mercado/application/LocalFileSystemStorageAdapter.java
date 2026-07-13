package com.mutualista.mercado.application;

import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service // Este será reemplazado por HuaweiCloudStorageAdapter en el futuro
public class LocalFileSystemStorageAdapter implements StorageService {
    private final String RUTA_BASE = "uploads/";

    @Override
    public String guardarArchivo(byte[] contenido, String nombreOriginal) {
        try {
            // Asegurar que el directorio uploads/ existe
            Path dir = Paths.get(RUTA_BASE);
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }

            // Generar un nombre único para evitar colisiones
            String extension = nombreOriginal.substring(nombreOriginal.lastIndexOf("."));
            String nombreArchivo = UUID.randomUUID().toString() + extension;
            Path rutaFisica = dir.resolve(nombreArchivo);
            
            Files.write(rutaFisica, contenido);
            
            // Retorna la URL lógica que el frontend consumirá
            return "/api/public/multimedia/" + nombreArchivo;
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar en disco local", e);
        }
    }
}
