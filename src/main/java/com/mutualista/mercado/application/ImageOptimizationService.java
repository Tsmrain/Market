package com.mutualista.mercado.application;

import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Service // Pure Fabrication para procesar imágenes
public class ImageOptimizationService {

    public byte[] optimizarImagen(byte[] imagenOriginal, String extension) {
        try {
            BufferedImage imagen = ImageIO.read(new ByteArrayInputStream(imagenOriginal));
            if (imagen == null) return imagenOriginal; // Si no es imagen, se devuelve tal cual (ej. video)

            // Regla de Negocio: Redimensionar a un máximo de 800px de ancho para web
            int maxAncho = 800;
            if (imagen.getWidth() <= maxAncho) return imagenOriginal;

            int nuevoAlto = (int) (imagen.getHeight() * ((double) maxAncho / imagen.getWidth()));
            Image imagenEscalada = imagen.getScaledInstance(maxAncho, nuevoAlto, Image.SCALE_SMOOTH);
            BufferedImage nuevaImagen = new BufferedImage(maxAncho, nuevoAlto, BufferedImage.TYPE_INT_RGB);

            Graphics2D g2d = nuevaImagen.createGraphics();
            g2d.drawImage(imagenEscalada, 0, 0, null);
            g2d.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            // Guardamos comprimido en formato original (jpg, png...)
            ImageIO.write(nuevaImagen, extension.replace(".", "").toLowerCase(), baos);
            return baos.toByteArray();
        } catch (Exception e) {
            // Si hay error en compresión, guardamos el original como mecanismo de tolerancia a fallos
            return imagenOriginal;
        }
    }
}
