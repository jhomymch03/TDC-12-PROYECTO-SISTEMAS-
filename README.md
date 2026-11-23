# Portafolio personal con CI/CD, Docker, Terraform, Ansible y Cloudflare

Proyecto de Sistemas II (TDC-12). El portafolio usa **React + Vite** en el frontend, **Node.js + Express** como API y **PostgreSQL** como base de datos.

## Qué incluye

- Sitio adaptable a móvil con presentación, habilidades, proyectos y contacto.
- API REST (`/api/health`, `/api/projects`, `POST /api/contact`) con persistencia de mensajes en PostgreSQL.
- Tres pruebas unitarias, tres de integración y tres E2E con Playwright.
- Cada push a `dev` ejecuta las pruebas automatizadas.
- Cada push a `main`, después de aprobar las pruebas, publica la imagen ARM64 en Docker Hub, crea una VCN, subnet pública y VM Ubuntu 24.04 en Oracle Cloud Infrastructure (OCI), actualiza DNS en Cloudflare y configura la VM con Ansible.
- VNC solo por túnel SSH; el puerto 5901 no se abre a Internet.

## Ejecutar localmente

Requisitos: Node.js 22 o superior, Docker y Docker Compose.

```powershell
npm install
Copy-Item .env.example .env
docker compose up -d db
npm run dev:all
```

Abre `http://localhost:4173`. La API usa `DATABASE_URL` del entorno (por defecto PostgreSQL local en el puerto 5432).

Para ejecutar las pruebas, inicia primero PostgreSQL:

```powershell
npm run test:unit
npm run test:integration
npx playwright install chromium
npm run test:e2e
```

También puedes levantar el portafolio completo con `docker compose up --build -d`; estará en `http://localhost`.

## Personalizar el portafolio

Edita nombre, ubicación, correo y descripción en `src/App.jsx`. Los proyectos de ejemplo están en `server/db.js`; estilos y colores, en `src/styles.css`.

## GitHub Actions

Workflow: `.github/workflows/ci-cd.yml`.

- `dev`: ejecuta unit, integración y E2E en cada push.
- `main`: vuelve a ejecutar las pruebas; si pasan, publica la imagen `latest` y otra con el SHA del commit. Luego ejecuta Terraform y Ansible para desplegar en OCI.

El repositorio ya tiene `DOCKERHUB_USERNAME` y `DOCKERHUB_TOKEN` configurados. Antes de hacer push a `main`, completa los siguientes valores en GitHub, en **Settings → Secrets and variables → Actions**.

### Secrets

| Nombre | Valor |
| --- | --- |
| `OCI_TENANCY_OCID` | OCID de la tenancy de OCI. |
| `OCI_USER_OCID` | OCID del usuario de OCI que ejecutará Terraform. |
| `OCI_FINGERPRINT` | Fingerprint de la API signing key asociada al usuario. |
| `OCI_PRIVATE_KEY` | Contenido completo de la llave privada API signing en PEM, sin contraseña. |
| `OCI_SSH_PRIVATE_KEY` | Contenido completo de la llave privada SSH que corresponde a `OCI_SSH_PUBLIC_KEY`; Ansible la usa para conectarse a la VM. |
| `DOCKERHUB_USERNAME` | Ya configurado: usuario de Docker Hub. |
| `DOCKERHUB_TOKEN` | Ya configurado: PAT de Docker Hub con permiso Repo Read & Write. |
| `CLOUDFLARE_API_TOKEN` | Token de Cloudflare limitado a editar DNS de la zona del dominio. |
| `CLOUDFLARE_ZONE_ID` | Zone ID del dominio en Cloudflare. |

No compartas estos secretos por chat ni los agregues a `.env`, `.tfvars`, Git o al workflow. El flujo escribe la llave API en un archivo temporal protegido dentro del runner de GitHub.

### Variables

| Nombre | Valor |
| --- | --- |
| `OCI_REGION` | Región OCI, por ejemplo `us-ashburn-1`. |
| `OCI_COMPARTMENT_OCID` | OCID del compartimento donde se crearán red y VM. |
| `OCI_OBJECT_STORAGE_NAMESPACE` | Namespace de Object Storage de la tenancy. |
| `OCI_TFSTATE_BUCKET` | Bucket privado de Object Storage, creado antes del primer despliegue. |
| `OCI_SSH_PUBLIC_KEY` | Clave pública SSH correspondiente a `OCI_SSH_PRIVATE_KEY`. |
| `SSH_ALLOWED_CIDR` | Tu IP pública seguida de `/32`, para restringir SSH. |
| `DOMAIN_NAME` | Dominio raíz cuya zona DNS está activa en Cloudflare, sin `https://`. |
| `LETSENCRYPT_EMAIL` | Correo válido para emitir el certificado TLS. |

`OCI_REGION` debe ser la región donde se creó el bucket de estado. El bucket debe tener acceso privado y versionado habilitado. Terraform usa el backend nativo de OCI, que requiere Terraform 1.12 o posterior.

## Preparar OCI y Cloudflare

1. En OCI, elige una región y un compartimento donde tu usuario tenga permisos para crear instancias, redes y recursos de Object Storage.
2. Crea un bucket privado para Terraform. Activa el versionado y copia su nombre y el namespace de Object Storage.
3. En **Profile → User settings → API Keys**, crea o selecciona una API signing key. Copia el tenancy OCID, user OCID y fingerprint visibles en OCI. Para Actions necesitas la clave privada PEM asociada; una privada ya existente no se puede volver a descargar.
4. Crea un par de claves SSH, conserva la privada localmente y configura la pública como `OCI_SSH_PUBLIC_KEY`. Sube la privada correspondiente como el secreto `OCI_SSH_PRIVATE_KEY`.
5. Añade el dominio a Cloudflare, activa su zona con los nameservers indicados por Cloudflare y crea un API token con permisos de edición DNS para solo esa zona.
6. Completa los secretos y variables de las tablas en GitHub.

Terraform configura una VM `VM.Standard.A1.Flex` (ARM64) con Ubuntu 24.04, una VCN, una subnet pública, reglas para SSH restringido, HTTP y HTTPS, y una IP pública. El workflow construye la imagen `linux/arm64` para esa forma. La capacidad y elegibilidad Always Free dependen de la región, límites y disponibilidad de OCI; verifica el costo estimado en tu cuenta antes del despliegue.

El flujo crea los registros `A @` y `CNAME www`. Ansible instala Docker, Git, UFW/iptables, VNC, Nginx y TLS. Espera a que se propaguen DNS antes del primer despliegue si acabas de delegar el dominio a Cloudflare.

## Terraform manual

Terraform también puede ejecutarse localmente con un perfil `DEFAULT` en `~/.oci/config` y las variables indicadas en `terraform/terraform.tfvars.example`.

```bash
cd terraform
terraform init \
  -backend-config="bucket=NOMBRE_BUCKET" \
  -backend-config="namespace=NAMESPACE_OBJECT_STORAGE" \
  -backend-config="key=portfolio/terraform.tfstate" \
  -backend-config="region=us-ashburn-1" \
  -backend-config="config_file_profile=DEFAULT"
terraform plan
terraform apply
```

El bucket debe estar creado y el usuario OCI debe tener permisos de lectura/escritura/borrado de objetos en ese bucket. `terraform output` muestra la IP pública, URL y comando para el túnel VNC.

## Acceso a VNC

Tras el primer despliegue, usa `vnc_tunnel_command` reemplazando `<tu-clave.pem>` por la ruta local a la llave SSH privada. Deja la sesión SSH abierta y conecta un cliente VNC a `127.0.0.1:5901`. El servidor VNC escucha solo en loopback.

## Estructura

```text
src/                         React, estilos y portafolio
server/                      API Express y PostgreSQL
tests/unit/                  pruebas unitarias
tests/integration/           pruebas de integración
tests/e2e/                   pruebas de navegador
.github/workflows/ci-cd.yml  CI para dev y despliegue OCI en main
Dockerfile                   imagen del portafolio
docker-compose.yml           aplicación + PostgreSQL
terraform/                   VCN, subnet, VM Ubuntu 24.04 ARM64, IP y DNS
ansible/                     Docker, Git, firewall, VNC, Nginx y despliegue
```

