locals {
  cloudflare_enabled = var.domain_name != "" && var.cloudflare_zone_id != "" && var.cloudflare_api_token != ""
}
data "oci_identity_availability_domains" "available" {
  compartment_id = var.compartment_ocid
}

data "oci_core_images" "ubuntu_2404" {
  compartment_id           = var.compartment_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = var.instance_shape
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_vcn" "portfolio" {
  compartment_id = var.compartment_ocid
  cidr_block     = "10.24.0.0/16"
  display_name   = "${var.project_name}-vcn"
  dns_label      = "portfolio"
}

resource "oci_core_internet_gateway" "portfolio" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio.id
  display_name   = "${var.project_name}-igw"
  enabled        = true
}

resource "oci_core_route_table" "public" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio.id
  display_name   = "${var.project_name}-public-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.portfolio.id
  }
}

resource "oci_core_security_list" "portfolio" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.portfolio.id
  display_name   = "${var.project_name}-security-list"

  ingress_security_rules {
    protocol    = "6"
    source      = var.ssh_allowed_cidr
    source_type = "CIDR_BLOCK"
    description = "SSH restringido a la IP de salida del runner de CI"

    tcp_options {
      min = 22
      max = 22
    }
  }

  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    description = "HTTP"

    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol    = "6"
    source      = "0.0.0.0/0"
    source_type = "CIDR_BLOCK"
    description = "HTTPS"

    tcp_options {
      min = 443
      max = 443
    }
  }

  egress_security_rules {
    protocol         = "all"
    destination      = "0.0.0.0/0"
    destination_type = "CIDR_BLOCK"
  }
}

resource "oci_core_subnet" "public" {
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.portfolio.id
  cidr_block        = "10.24.1.0/24"
  display_name      = "${var.project_name}-public-subnet"
  dns_label         = "public"
  route_table_id    = oci_core_route_table.public.id
  security_list_ids = [oci_core_security_list.portfolio.id]
}

resource "oci_core_instance" "portfolio" {
  availability_domain = data.oci_identity_availability_domains.available.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  display_name        = "${var.project_name}-vm"
  shape               = var.instance_shape

  shape_config {
    ocpus         = var.instance_ocpus
    memory_in_gbs = var.instance_memory_gbs
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public.id
    assign_public_ip = true
    display_name     = "${var.project_name}-vnic"
    hostname_label   = "portfolio"
  }

  source_details {
    source_type             = "image"
    source_id               = data.oci_core_images.ubuntu_2404.images[0].id
    boot_volume_size_in_gbs = 50
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
  }

  freeform_tags = {
    Project = var.project_name
  }
}

data "oci_core_vnic_attachments" "portfolio" {
  compartment_id = var.compartment_ocid
  instance_id    = oci_core_instance.portfolio.id
}

data "oci_core_vnic" "portfolio" {
  vnic_id = data.oci_core_vnic_attachments.portfolio.vnic_attachments[0].vnic_id
}

resource "cloudflare_record" "root" {
  count           = local.cloudflare_enabled ? 1 : 0
  zone_id         = var.cloudflare_zone_id
  name            = "@"
  content         = data.oci_core_vnic.portfolio.public_ip_address
  type            = "A"
  proxied         = true
  ttl             = 1
  allow_overwrite = true
}

resource "cloudflare_record" "www" {
  count           = local.cloudflare_enabled ? 1 : 0
  zone_id         = var.cloudflare_zone_id
  name            = "www"
  content         = var.domain_name
  type            = "CNAME"
  proxied         = true
  ttl             = 1
  allow_overwrite = true
}



