variable "tenancy_ocid" {
  description = "OCID de la tenancy de Oracle Cloud."
  type        = string
}

variable "compartment_ocid" {
  description = "OCID del compartimento OCI donde se crearán los recursos."
  type        = string
}

variable "region" {
  description = "Región OCI."
  type        = string
}

variable "project_name" {
  description = "Prefijo para los recursos."
  type        = string
  default     = "portfolio-tdc12"
}

variable "instance_shape" {
  description = "Forma Ampere ARM compatible con la cuota Always Free de OCI."
  type        = string
  default     = "VM.Standard.A1.Flex"
}

variable "instance_ocpus" {
  description = "OCPUs para la VM Ampere."
  type        = number
  default     = 1
}

variable "instance_memory_gbs" {
  description = "Memoria en GB para la VM Ampere."
  type        = number
  default     = 6
}

variable "ssh_allowed_cidr" {
  description = "CIDR autorizado a SSH (22); usar la IP pública seguida de /32."
  type        = string
}

variable "ssh_public_key" {
  description = "Clave pública SSH que OCI instalará para el usuario ubuntu."
  type        = string
}

variable "cloudflare_api_token" {
  description = "API token de Cloudflare con permisos para editar DNS (opcional si aún no hay dominio)."
  type        = string
  sensitive   = true
  default     = ""
}

variable "cloudflare_zone_id" {
  description = "Zone ID de la zona Cloudflare (opcional si aún no hay dominio)."
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Dominio raíz administrado en Cloudflare. Déjalo vacío para desplegar solo en la IP pública."
  type        = string
  default     = ""
}

variable "dockerhub_image" {
  description = "Imagen ARM64 publicada en Docker Hub."
  type        = string
}

