variable "aws_region" {
  description = "RegiÃ³n de AWS para la VM."
  type        = string
  default     = "us-east-1"
}
variable "project_name" {
  description = "Prefijo para los recursos."
  type        = string
  default     = "portfolio-tdc12"
}
variable "instance_type" {
  description = "Tipo de instancia EC2."
  type        = string
  default     = "t3.small"
}
variable "key_name" {
  description = "Nombre de un key pair EC2 existente."
  type        = string
}
variable "ssh_allowed_cidr" {
  description = "CIDR autorizado a SSH (22); reemplazar por tu IP pÃºblica/32."
  type        = string
}
variable "cloudflare_api_token" {
  description = "API token de Cloudflare con permisos de editar DNS."
  type        = string
  sensitive   = true
}
variable "cloudflare_zone_id" {
  description = "Zone ID de la zona Cloudflare."
  type        = string
}
variable "domain_name" {
  description = "Dominio raÃ­z administrado en Cloudflare."
  type        = string
}
variable "dockerhub_image" {
  description = "Imagen completa publicada en Docker Hub."
  type        = string
}
