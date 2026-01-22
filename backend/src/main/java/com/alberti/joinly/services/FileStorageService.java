package com.alberti.joinly.services;

import com.alberti.joinly.config.FileStorageProperties;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final FileStorageProperties properties;

    public String saveAvatar(MultipartFile file) throws IOException {
        log.info("Guardando avatar: nombre={}, tamaño={}", file.getOriginalFilename(), file.getSize());
        validateFile(file);

        Path uploadPath = Paths.get(properties.getLocation());
        if (!Files.exists(uploadPath)) {
            log.info("Creando directorio de avatares: {}", uploadPath.toAbsolutePath());
            Files.createDirectories(uploadPath);
        }

        String extension = getFileExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID().toString() + "." + extension;
        Path targetPath = uploadPath.resolve(filename);

        log.info("Procesando imagen: {} -> {}", file.getOriginalFilename(), filename);

        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        log.info("Dimensiones originales: {}x{}", originalWidth, originalHeight);

        BufferedImage resizedImage = resizeImage(originalImage,
            properties.getResizeDimension(),
            properties.getResizeDimension());

        ImageIO.write(resizedImage, extension, targetPath.toFile());

        String avatarPath = properties.getLocation() + "/" + filename;
        log.info("Avatar guardado exitosamente: {}", avatarPath);

        return avatarPath;
    }

    public void deleteAvatar(String avatarUrl) {
        try {
            // Convertir URL (/uploads/avatars/file.jpg) a ruta de sistema
            String filename = Paths.get(avatarUrl).getFileName().toString();
            Path path = Paths.get(properties.getLocation()).resolve(filename);
            log.info("Eliminando avatar: {}", path);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.error("Error al eliminar avatar {}: {}", avatarUrl, e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }

        if (file.getSize() > properties.getMaxSize()) {
            throw new IllegalArgumentException(
                "El archivo excede el tamaño máximo de " +
                (properties.getMaxSize() / 1024 / 1024) + "MB"
            );
        }

        String contentType = file.getContentType();
        String[] allowedTypes = properties.getAllowedTypes().split(",");

        if (contentType == null ||
            Arrays.stream(allowedTypes).noneMatch(contentType::equals)) {
            throw new IllegalArgumentException(
                "Tipo de archivo no permitido. Permitidos: " +
                properties.getAllowedTypes()
            );
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "jpg";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private BufferedImage resizeImage(BufferedImage original, int width, int height) {
        int originalWidth = original.getWidth();
        int originalHeight = original.getHeight();

        int x, y, cropWidth, cropHeight;

        double originalRatio = (double) originalWidth / originalHeight;
        double targetRatio = (double) width / height;

        if (originalRatio > targetRatio) {
            cropHeight = originalHeight;
            cropWidth = (int) (originalHeight * targetRatio);
            x = (originalWidth - cropWidth) / 2;
            y = 0;
        } else {
            cropWidth = originalWidth;
            cropHeight = (int) (originalWidth / targetRatio);
            x = 0;
            y = (originalHeight - cropHeight) / 2;
        }

        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = resized.createGraphics();

        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
            RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING,
            RenderingHints.VALUE_RENDER_QUALITY);
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
            RenderingHints.VALUE_ANTIALIAS_ON);

        graphics.drawImage(original,
            0, 0, width, height,
            x, y, x + cropWidth, y + cropHeight,
            null);
        graphics.dispose();

        return resized;
    }
}
