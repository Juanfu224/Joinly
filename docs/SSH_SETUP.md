# 🔑 Cómo Habilitar SSH en tu VPS

Tu servidor **159.89.1.100** está en línea pero **no tiene SSH habilitado**. Esto es normal en servidores nuevos por seguridad.

---

## 🎯 Problema Actual

```bash
$ ssh root@159.89.1.100
ssh: connect to host 159.89.1.100 port 22: Connection refused
```

**Razón**: El puerto SSH (22) está cerrado o el servicio SSH no está instalado/iniciado.

---

## ✅ Solución Rápida

### Opción 1: Consola Web del Proveedor (Recomendado)

La mayoría de proveedores VPS (DigitalOcean, Vultr, Linode, etc.) ofrecen una **consola web** para acceder al servidor:

#### Digital Ocean:
1. Ve a [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Click en tu Droplet
3. Click en **"Access"** o **"Console"** en el menú
4. Se abrirá una terminal en el navegador
5. Inicia sesión como root

#### Vultr:
1. Ve a [my.vultr.com](https://my.vultr.com)
2. Click en tu servidor
3. Click en el icono de **monitor** (View Console)
4. Se abrirá una consola VNC
5. Inicia sesión como root

#### Hetzner/OVH/Otros:
- Busca **"Console"**, **"KVM"** o **"VNC"** en el panel de control
- Todos los proveedores tienen algún método de acceso directo

### Una vez en la Consola Web:

```bash
# 1. Verificar si SSH está instalado
dpkg -l | grep openssh-server

# 2. Si no está instalado, instalarlo
apt update
apt install -y openssh-server

# 3. Iniciar el servicio SSH
systemctl start ssh
systemctl enable ssh

# 4. Verificar que está corriendo
systemctl status ssh

# 5. Verificar que el puerto 22 está abierto
ss -tulpn | grep :22

# 6. Configurar firewall (si está habilitado)
ufw allow ssh
ufw reload

# 7. Obtener la configuración de red
ip addr show
```

---

### Opción 2: API/CLI del Proveedor

Algunos proveedores permiten ejecutar comandos via API o CLI:

#### Digital Ocean CLI (doctl):
```bash
# Instalar doctl
snap install doctl

# Autenticar
doctl auth init

# Ejecutar comando en el droplet
doctl compute ssh <droplet-id> --ssh-command "systemctl start ssh"
```

---

## 🔍 Verificación Post-Configuración

Después de habilitar SSH, verifica desde tu máquina local:

```bash
# 1. Verificar que el puerto está abierto
nc -zv 159.89.1.100 22

# 2. Intentar conectar via SSH
ssh root@159.89.1.100

# 3. Si pide contraseña, verifica en el panel del proveedor
# O usa tu clave SSH si ya la configuraste
```

---

## 🔐 Configurar Clave SSH (Después de Habilitar SSH)

### En tu máquina local:

```bash
# 1. Generar clave SSH (si no tienes una)
ssh-keygen -t ed25519 -C "tu@email.com"

# 2. Copiar la clave al servidor
ssh-copy-id root@159.89.1.100

# 3. O manualmente:
cat ~/.ssh/id_ed25519.pub

# Luego en el servidor:
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Pega la clave pública aquí
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## ⚙️ Mejores Prácticas de Seguridad SSH

Una vez que SSH esté funcionando, mejora la seguridad:

```bash
# En el servidor, editar configuración SSH
nano /etc/ssh/sshd_config

# Cambiar estos valores:
Port 22                          # O usa otro puerto como 2222
PermitRootLogin prohibit-password # No permitir login con contraseña
PasswordAuthentication no        # Deshabilitar autenticación por contraseña
PubkeyAuthentication yes         # Solo permitir claves SSH

# Reiniciar SSH
systemctl restart ssh
```

---

## 🚀 Desplegar Después de Habilitar SSH

Una vez que SSH esté funcionando:

```bash
# Método 1: Script automático
./scripts/quick-deploy.sh root@159.89.1.100

# Método 2: Manual
ssh root@159.89.1.100
curl -sSL https://raw.githubusercontent.com/Juanfu224/Joinly/main/scripts/quick-deploy.sh | bash
```

---

## 🆘 Si Sigues sin Poder Conectar

### Verifica el Firewall del Proveedor

Algunos proveedores tienen **firewall adicional** en el panel de control:

- **Digital Ocean**: Security → Firewalls → Crear regla para puerto 22
- **Vultr**: Firewall → Allow SSH (port 22)
- **Hetzner**: Firewall → Add rule → SSH

### Verifica Cloud-init/UserData

Si el servidor se creó con cloud-init personalizado, puede que esté bloqueando SSH:

```bash
# Ver logs de cloud-init
cat /var/log/cloud-init.log
cat /var/log/cloud-init-output.log
```

### Verifica SELinux/AppArmor

```bash
# Verificar SELinux
getenforce
# Si está en enforcing, temporalmente deshabilitarlo:
setenforce 0

# Verificar AppArmor
aa-status
```

---

## 📞 Contactar Soporte del Proveedor

Si nada funciona, contacta el soporte:

- **Digital Ocean**: [cloud.digitalocean.com/support](https://cloud.digitalocean.com/support)
- **Vultr**: [my.vultr.com/support/](https://my.vultr.com/support/)
- **Linode**: [cloud.linode.com/support](https://cloud.linode.com/support)

Pregunta específicamente:
> "Necesito habilitar SSH en mi servidor 159.89.1.100, el puerto 22 está cerrado"

---

## ✅ Checklist de Solución

- [ ] Acceder via consola web del proveedor
- [ ] Verificar que SSH está instalado: `dpkg -l | grep openssh`
- [ ] Iniciar SSH: `systemctl start ssh`
- [ ] Habilitar SSH al inicio: `systemctl enable ssh`
- [ ] Abrir puerto 22 en firewall: `ufw allow ssh`
- [ ] Verificar desde local: `ssh root@159.89.1.100`
- [ ] Configurar clave SSH
- [ ] Ejecutar despliegue

---

**Una vez que SSH esté funcionando, continúa con la [Guía de Despliegue Rápido](./QUICKSTART_DEPLOY.md).**
