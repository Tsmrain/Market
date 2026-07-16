package com.mutualista.mercado.application;

public interface StorageService {
    String guardarArchivo(byte[] contenido, String nombreOriginal);
    void borrarArchivo(String urlArchivo);
}
