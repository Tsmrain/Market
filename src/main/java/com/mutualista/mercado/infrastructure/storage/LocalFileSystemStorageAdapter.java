package com.mutualista.mercado.infrastructure.storage;

import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service // Este será reemplazado por HuaweiCloudStorageAdapter en el futuro
public class LocalFileSystemStorageAdapter implements StorageService {
    private final String RUTA_BASE = "uploads/";

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            Path dir = Paths.get(RUTA_BASE);
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }
        } catch (Exception e) {
            System.err.println("Error al inicializar directorio de subidas local: " + e.getMessage());
        }
    }

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
            return "/uploads/" + nombreArchivo;
        } catch (Exception e) {
            throw new RuntimeException("Error al guardar en disco local", e);
        }
    }

    @Override
    public void borrarArchivo(String urlArchivo) {
        if (urlArchivo == null || urlArchivo.trim().isEmpty()) {
            return;
        }
        try {
            // Extraer el nombre del archivo de la URL
            String nombreArchivo = urlArchivo.substring(urlArchivo.lastIndexOf("/") + 1);
            Path rutaFisica = java.nio.file.Paths.get(RUTA_BASE).resolve(nombreArchivo);
            
            // Borrar si existe
            boolean borrado = java.nio.file.Files.deleteIfExists(rutaFisica);
            if (borrado) {
                System.out.println("Archivo físico borrado exitosamente: " + rutaFisica.toString());
            } else {
                System.out.println("El archivo físico no existía al intentar borrarlo: " + rutaFisica.toString());
            }
        } catch (Exception e) {
            // warning log, do not throw exception as requested
            System.err.println("Error al borrar archivo físico: " + e.getMessage());
        }
    }
}
