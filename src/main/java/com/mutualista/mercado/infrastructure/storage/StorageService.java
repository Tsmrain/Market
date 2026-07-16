package com.mutualista.mercado.infrastructure.storage;

public interface StorageService {
    String guardarArchivo(byte[] contenido, String nombreOriginal);
    void borrarArchivo(String urlArchivo);
}
