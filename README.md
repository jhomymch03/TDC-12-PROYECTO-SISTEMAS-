# Portafolio personal con CI/CD, Docker, Terraform, Ansible y Cloudflare

Proyecto de Sistemas II (TDC-12). El portafolio usa **React + Vite** en el frontend, **Node.js + Express** como API y **PostgreSQL** como base de datos.

## QuÃ© incluye

- Sitio personal adaptable a mÃ³vil, secciÃ³n de presentaciÃ³n, habilidades, proyectos y contacto.
- API REST (`/api/health`, `/api/projects`, `POST /api/contact`) y persistencia de mensajes en PostgreSQL.
- 3 pruebas unitarias, 3 de integraciÃ³n y 3 E2E con Playwright.
- GitHub Actions: cada push/PR a `dev` corre las pruebas. Cada push a `main`, despuÃ©s de aprobar las pruebas, construye y publica la imagen en Docker Hub; Terraform crea la red y VM Ubuntu 24.04 y registros DNS; Ansible instala Docker, Git, UFW/iptables, VNC, Nginx y TLS y despliega la app.
- Acceso VNC solo por tÃºnel SSH. El puerto 5901 no se publica en el firewall.

## Ejecutar localmente

Requisitos: Node.js 22 o superior, Docker y Docker Compose.

```bash
npm install
Copy-Item .env.example .env
# Levanta PostgreSQL local
Docker compose up -d db
# En otra terminal: API y frontend de desarrollo
npm run dev:all
```

Abre `http://localhost:4173`. La API usa `DATABASE_URL` del entorno (por defecto PostgreSQL local en el puerto 5432). Para correr las pruebas, primero inicia PostgreSQL y luego ejecuta:

```bash
npm run test:unit
npm run test:integration
npx playwright install chromium
npm run test:e2e
```

TambiÃ©n puedes levantar el portafolio completo en Docker con `docker compose up --build -d`; estarÃ¡ en `http://localhost`.

## Personalizar el contenido

Edita `Tu Nombre`, ubicaciÃ³n, correo y descripciÃ³n en `src/App.jsx`. Cambia los proyectos de muestra en `server/db.js` y, si quieres, actualiza las etiquetas de habilidades y colores en `src/styles.css`. Los tres proyectos se insertan en PostgreSQL automÃ¡ticamente al primer inicio.

## Ramas y pipeline

1. Crea en GitHub un repositorio llamado `portfolio-ci-infra` (o actualiza el nombre de imagen en `.github/workflows/ci-cd.yml`).
2. La carpeta ya está inicializada en la rama `main`. Sube el proyecto: `git add .`, `git commit -m "Proyecto inicial del portafolio"`, `git remote add origin https://github.com/TU_USUARIO/portfolio-ci-infra.git`, `git push -u origin main`.
3. Crea y publica `dev`: `git switch -c dev` y `git push -u origin dev`.
4. En cada push a `dev` se ejecutan unit, integraciÃ³n y E2E. Los PR hacia `dev` o `main` ejecutan las mismas pruebas.
5. Un push directo a `main` publica dos tags en Docker Hub (`latest` y el SHA del commit), crea/actualiza infraestructura y DNS con Terraform, y configura/despliega la VM con Ansible.

Workflow: `.github/workflows/ci-cd.yml`.

## Preparar AWS, Docker Hub y Cloudflare

**La automatizaciÃ³n no puede crear recursos en tus cuentas hasta que agregues credenciales propias.** Necesitas una cuenta AWS, un dominio cuya zona DNS estÃ© activa en Cloudflare, un repositorio Docker Hub y un key pair EC2 existente.

Configura en GitHub (`Settings > Secrets and variables > Actions`) antes de hacer el primer push a `main`:

### Secrets

- `AWS_ACCESS_KEY_ID`: credencial de IAM con permisos para administrar VPC, subnet, rutas, security groups, EC2 y Elastic IP.
- `AWS_SECRET_ACCESS_KEY`: secreto asociado.
- `DOCKERHUB_USERNAME`: usuario de Docker Hub.
- `DOCKERHUB_TOKEN`: token de acceso de Docker Hub con permiso de escritura.
- `CLOUDFLARE_API_TOKEN`: token de Cloudflare limitado a la zona y con permiso de editar DNS.
- `CLOUDFLARE_ZONE_ID`: Zone ID de tu zona.
- `EC2_SSH_PRIVATE_KEY`: contenido completo de la llave privada del key pair EC2 (nunca la subas al repositorio).

### Variables

- `AWS_REGION`: por ejemplo `us-east-1` (opcional, ese es el valor predeterminado).
- `AWS_TF_STATE_BUCKET`: nombre de un bucket S3 privado y previamente creado para guardar el estado de Terraform (habilita versionado y bloqueo de acceso público). El rol/usuario de AWS también necesita `s3:ListBucket`, `s3:GetObject`, `s3:PutObject` y `s3:DeleteObject` para el estado y su archivo `.tflock`.
- `AWS_EC2_KEY_NAME`: nombre exacto del key pair que existe en esa regiÃ³n de AWS.
- `SSH_ALLOWED_CIDR`: tu IP pÃºblica seguida de `/32`, por ejemplo `203.0.113.10/32`. Restringe el acceso SSH.
- `DOMAIN_NAME`: dominio raÃ­z en Cloudflare, sin `https://`, por ejemplo `midominio.com`.
- `LETSENCRYPT_EMAIL`: correo vÃ¡lido para emitir el certificado TLS de Let's Encrypt.

Cloudflare debe tener la zona activa y con nameservers del dominio delegados a Cloudflare. El flujo crea `A @` y `CNAME www` apuntando a la Elastic IP. Ansible solicita el certificado TLS y configura Nginx para HTTPS. Espera la propagaciÃ³n DNS antes del primer despliegue si acabas de cambiar nameservers.

## Terraform manual (alternativa)

Crea una vez un bucket S3 privado para el estado (por ejemplo `mi-proyecto-terraform-state`, con versionado habilitado). El backend S3 mantiene el estado y usa bloqueo nativo de Terraform; Actions necesita el nombre en `AWS_TF_STATE_BUCKET`.

Desde `terraform/`, copia `terraform.tfvars.example` a `terraform.tfvars`, completa regiÃ³n, nombre del key pair, CIDR, Zone ID y dominio; exporta `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `TF_VAR_cloudflare_api_token` y `TF_STATE_BUCKET`. Inicializa con `terraform init -backend-config="bucket=$TF_STATE_BUCKET" -backend-config="key=portfolio/terraform.tfstate" -backend-config="region=us-east-1" -backend-config="encrypt=true" -backend-config="use_lockfile=true"`. Luego:

```bash
terraform plan
terraform apply
```

El costo de AWS depende de la regiÃ³n y el tiempo de uso de la EC2/EIP. Al terminar la demostraciÃ³n, ejecuta `terraform destroy` desde la misma carpeta y con el mismo estado para evitar costos posteriores.

## Acceso a VNC

Tras el primer despliegue, usa la salida `vnc_tunnel_command` de Terraform reemplazando `<tu-clave.pem>` por la ruta local a tu llave privada. Deja la sesiÃ³n SSH abierta y conecta un cliente VNC a `127.0.0.1:5901`. El servidor escucha solo en loopback; el tÃºnel cifra el trÃ¡fico y no expone 5901 en Internet.

## Estructura

```text
src/                         React, estilos y portafolio
server/                      API Express, validaciÃ³n y PostgreSQL
tests/unit/                  3 pruebas unitarias
tests/integration/           3 pruebas de integraciÃ³n
tests/e2e/                   3 pruebas de navegador
.github/workflows/ci-cd.yml  CI para dev y despliegue de main
Dockerfile                   imagen multi-stage del portafolio
docker-compose.yml           aplicaciÃ³n + PostgreSQL
terraform/                   VPC, subnet pÃºblica, EC2 Ubuntu 24.04, EIP y DNS
ansible/                     Docker, Git, firewall, VNC, Nginx y despliegue
```
