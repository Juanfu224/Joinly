# Configuración de Variables de Entorno

## Ubicación Centralizada
Todos los archivos de configuración están en la **raíz del proyecto**:
- `.env` → Variables reales (NO subir a Git)
- `.env.example` → Plantilla de ejemplo

## ¿Por qué centralizado?
1. **Simplicidad**: Un solo lugar para configurar todo
2. **Docker Compose**: Lee automáticamente `.env` de la raíz
3. **Spring Boot**: Lee variables de entorno del sistema
4. **Sin duplicación**: Evita errores de sincronización

## Uso en cada componente

### Docker Compose
```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
```
Lee automáticamente desde `.env` en la raíz.

### Spring Boot
```properties
spring.datasource.password=${DB_PASSWORD}
```
Lee variables de entorno exportadas por el sistema.

### Scripts de inicio
```bash
export $(grep -v '^#' .env | xargs)
```
Carga las variables antes de ejecutar Spring Boot.

## Mejores prácticas (Spring Boot 4.0 + Java 25)
- ✅ Variables de entorno en `.env`
- ✅ Valores por defecto en `application.properties`
- ✅ ConfigurationProperties para propiedades personalizadas
- ✅ Perfiles específicos con `application-{profile}.properties`
- ✅ Secrets en producción con servicios especializados
- ❌ No hardcodear valores sensibles en el código
- ❌ No duplicar archivos `.env`

## Generación de claves seguras
```bash
# JWT Secret (512 bits)
openssl rand -base64 64

# AES-256 Key (256 bits)
openssl rand -base64 32
```
