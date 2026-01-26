# Smoke Testing Producción - Punto 8.5

## Fecha: 26 de enero de 2026

---

## Objetivo

Verificar que los **flujos críticos de usuario** funcionan correctamente en producción:
https://joinly.studio

---

## Flujos a Verificar

### 1. Registro → Login → Dashboard

#### Pasos:
1. ✅ Acceder a https://joinly.studio
2. ✅ Click en "Crear cuenta"
3. ✅ Completar formulario de registro:
   - Nombre completo
   - Email válido
   - Contraseña fuerte (8+ caracteres, mayúscula, número)
   - Confirmar contraseña
4. ✅ Verificar email (si aplica)
5. ✅ Iniciar sesión con credenciales registradas
6. ✅ Verificar redirección a dashboard
7. ✅ Verificar que dashboard carga grupos del usuario
8. ✅ Verificar que no hay errores en consola

#### Criterios de Éxito:
- [ ] Registro exitoso con usuario creado
- [ ] Login funciona con credenciales correctas
- [ ] Dashboard carga sin errores
- [ ] Navegación fluida sin cuellos
- [ ] Datos de usuario mostrados correctamente

#### Errores Comunes:
- Error: "Email ya registrado" → Verificar email único en DB
- Error: "Credenciales inválidas" → Verificar encriptación BCrypt
- Error: "Error al cargar dashboard" → Verificar API /unidades

---

### 2. Crear Grupo → Invitar Miembros

#### Pasos:
1. ✅ En dashboard, click en "Crear unidad familiar"
2. ✅ Completar formulario:
   - Nombre del grupo (2-100 caracteres)
   - Descripción (opcional)
3. ✅ Click en "Crear grupo"
4. ✅ Verificar que grupo aparece en dashboard
5. ✅ Click en el grupo creado
6. ✅ En detalle de grupo, click en "Invitar miembros"
7. ✅ Copiar código de invitación
8. ✅ Verificar que código se copia al portapapeles
9. ✅ Compartir código con otro usuario
10. ✅ Verificar que código funciona para unirse

#### Criterios de Éxito:
- [ ] Grupo creado exitosamente
- [ ] Grupo aparece en dashboard
- [ ] Código de invitación generado (12 dígitos)
- [ ] Código se copia al portapapeles
- [ ] Otro usuario puede unirse con código

#### Errores Comunes:
- Error: "Nombre ya en uso" → Verificar unicidad de nombre
- Error: "No se pudo crear grupo" → Verificar validaciones backend
- Error: "Código inválido" → Verificar formato y unicidad

---

### 3. Unirse a Grupo con Código

#### Pasos:
1. ✅ En dashboard, click en "Unirse a un grupo"
2. ✅ Ingresar código de invitación de 12 dígitos
3. ✅ Click en "Unirse al grupo"
4. ✅ Verificar que solicitud se envía
5. ✅ Verificar notificación de solicitud enviada
6. ✅ Como administrador del grupo, ver solicitud
7. ✅ Aceptar solicitud de miembro
8. ✅ Verificar que miembro aparece en lista de miembros

#### Criterios de Éxito:
- [ ] Solicitud enviada exitosamente
- [ ] Administrador recibe notificación
- [ ] Solicitud aceptada correctamente
- [ ] Miembro aparece en lista de miembros
- [ ] Contador de miembros actualizado

#### Errores Comunes:
- Error: "Código inválido" → Verificar formato y existencia
- Error: "Grupo no encontrado" → Verificar que grupo está activo
- Error: "Ya eres miembro" → Verificar lógica de membresía

---

### 4. Crear Suscripción en Grupo

#### Pasos:
1. ✅ En detalle de grupo, click en "Crear suscripción"
2. ✅ Seleccionar servicio del catálogo
3. ✅ Completar formulario:
   - Nombre del servicio
   - Precio total mensual
   - Número de plazas (1-20)
   - Periodicidad (mensual/anual)
   - Fecha de inicio
   - Credenciales (usuario/contraseña)
4. ✅ Click en "Crear suscripción"
5. ✅ Verificar que suscripción aparece en lista
6. ✅ Verificar que se calcula coste individual

#### Criterios de Éxito:
- [ ] Suscripción creada exitosamente
- [ ] Suscripción aparece en lista del grupo
- [ ] Coste individual calculado (precio / plazas)
- [ ] Credenciales encriptadas correctamente
- [ ] Fechas y periodicidad mostradas correctas

#### Errores Comunes:
- Error: "Datos inválidos" → Verificar validaciones formulario
- Error: "No hay plazas disponibles" → Verificar lógica
- Error: "Encriptación falló" → Verificar EncryptionService
- Error: "Servicio no encontrado" → Verificar catálogo

---

### 5. Ocupar Plaza en Suscripción

#### Pasos:
1. ✅ En detalle de suscripción, ver plazas disponibles
2. ✅ Click en "Ocupar plaza"
3. ✅ Verificar modal de confirmación
4. ✅ Confirmar ocupación
5. ✅ Verificar que plaza se marca como ocupada
6. ✅ Verificar que contador de plazas actualiza
7. ✅ Verificar que coste individual recalcula

#### Criterios de Éxito:
- [ ] Plaza ocupada exitosamente
- [ ] Estado actualiza a "OCUPADA"
- [ ] Contador de plazas disponible/ocupadas actualiza
- [ ] Usuario aparece en lista de ocupantes
- [ ] Coste individual recalculado para todos los miembros

#### Errores Comunes:
- Error: "No hay plazas" → Verificar disponibilidad
- Error: "Ya ocupaste una plaza" → Verificar lógica de unicidad
- Error: "No eres miembro" → Verificar autorización
- Error: "Coste inválido" → Verificar cálculo

---

### 6. Liberar Plaza de Suscripción

#### Pasos:
1. ✅ En detalle de suscripción, ver mis plazas ocupadas
2. ✅ Click en "Liberar plaza"
3. ✅ Verificar modal de confirmación
4. ✅ Confirmar liberación
5. ✅ Verificar que plaza se marca como disponible
6. ✅ Verificar que contador de plazas actualiza
7. ✅ Verificar que coste individual recalcula

#### Criterios de Éxito:
- [ ] Plaza liberada exitosamente
- [ ] Estado actualiza a "DISPONIBLE"
- [ ] Contador de plazas actualiza
- [ ] Usuario desaparece de lista de ocupantes
- [ ] Coste individual recalculado

#### Errores Comunes:
- Error: "No puedes liberar" → Verificar lógica de permisos
- Error: "Plaza no encontrada" → Verificar estado de suscripción
- Error: "Fallo al actualizar" → Verificar transacción BD

---

### 7. Logout → Login de Nuevo Usuario

#### Pasos:
1. ✅ Click en "Cerrar sesión"
2. ✅ Verificar que se limpian tokens
3. ✅ Verificar redirección a home
4. ✅ Intentar acceder a dashboard sin login
5. ✅ Verificar redirección a login
6. ✅ Login con otro usuario
7. ✅ Verificar acceso correcto al dashboard

#### Criterios de Éxito:
- [ ] Logout ejecutado correctamente
- [ ] Tokens limpiados (localStorage/sessionStorage)
- [ ] Redirección a home funciona
- [ ] Intento de acceso sin login redirige a login
- [ ] Login con nuevo usuario funciona
- [ ] Dashboard carga datos del nuevo usuario

#### Errores Comunes:
- Error: "No se pudo hacer logout" → Verificar AuthService.logout()
- Error: "Redirección falló" → Verificar Router config
- Error: "Tokens no se limpiaron" → Verificar localStorage.clear()

---

## Checklist de Verificación

| Flujo | Estado | Errores | Observaciones |
|---------|---------|-----------|---------------|
| Registro → Login → Dashboard | ⚠️ Pendiente | N/A | N/A |
| Crear Grupo → Invitar | ⚠️ Pendiente | N/A | N/A |
| Unirse a Grupo | ⚠️ Pendiente | N/A | N/A |
| Crear Suscripción | ⚠️ Pendiente | N/A | N/A |
| Ocupar Plaza | ⚠️ Pendiente | N/A | N/A |
| Liberar Plaza | ⚠️ Pendiente | N/A | N/A |
| Logout → Login | ⚠️ Pendiente | N/A | N/A |

---

## Herramientas para Testing

### 1. Chrome DevTools
- **Consola**: Verificar errores JavaScript
- **Network**: Verificar requests fallidos
- **Lighthouse**: Medir performance y accesibilidad
- **Application**: Verificar localStorage/sessionStorage

### 2. BrowserStack (Cross-browser Testing)
- **URL**: https://www.browserstack.com
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Tablet, Mobile

### 3. Postman/Thunder Client
- **Uso**: Testing de APIs directamente
- **Verificar**:
  - Status codes correctos
  - Response format válido
  - Headers de seguridad presentes

---

## Ejecución Manual

```bash
# Acceder a producción
# Navegar a https://joinly.studio

# Ejecutar flujos uno por uno
# Documentar resultados en esta sección

# Capturar screenshots de errores
# Revisar logs del backend: docker logs joinly-backend -f
```

---

## Conclusiones

### Estado de Smoke Testing: ⚠️ PENDIENTE DE EJECUCIÓN

- Todos los flujos críticos documentados
- Criterios de éxito definidos
- Errores comunes identificados
- Herramientas de testing documentadas

### Recomendaciones

1. **EJECUTAR** smoke testing completo antes de presentación
2. **DOCUMENTAR** screenshots de cada paso de los flujos
3. **REVISAR** logs del backend y frontend durante testing
4. **CORREGIR** errores inmediatamente antes de producción
5. **REPROBAR** flujos fallidos hasta que funcionen
6. **VALIDAR** contraseñas encriptadas, tokens JWT, CORS

---

**Calificación de Smoke Testing: Pendiente de Ejecución**
- Plan de pruebas completo y detallado
- Requiere ejecución manual en producción
- Documentará resultados y hallazgos
