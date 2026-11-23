output "public_ip" {
  description = "IP pública de la VM OCI."
  value       = data.oci_core_vnic.portfolio.public_ip_address
}

output "portfolio_url" {
  description = "URL del portafolio."
  value       = "https://${var.domain_name}"
}

output "vnc_tunnel_command" {
  description = "Ejecuta localmente para acceder al escritorio VNC por túnel SSH."
  value       = "ssh -i <tu-clave.pem> -L 5901:127.0.0.1:5901 ubuntu@${data.oci_core_vnic.portfolio.public_ip_address}"
}
