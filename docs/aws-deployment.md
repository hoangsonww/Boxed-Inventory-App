# 🚀 Boxed AWS + Ansible Deployment Guide

This document shows how to provision your **Boxed** infrastructure on AWS with Terraform, then configure & deploy the Boxed application with Ansible.

---

## 📁 Repository Layout

```
.
├── ansible/
│   ├── inventory/
│   │   └── production.ini
│   ├── roles/
│   │   ├── common/
│   │   │   ├── tasks/
│   │   │   │   └── main.yml
│   │   │   └── vars/
│   │   │       └── main.yml
│   │   └── boxed-app/
│   │       ├── tasks/
│   │       │   └── main.yml
│   │       ├── templates/
│   │       │   ├── nginx.conf.j2
│   │       │   └── pm2.service.j2
│   │       └── vars/
│   │           └── main.yml
│   ├── ansible.cfg
│   ├── playbook.yml
│   └── deploy.sh
└── aws/
│   ├── provider.tf
│   ├── variables.tf
│   ├── main.tf
│   ├── outputs.tf

````

---

## 🔧 1. Terraform (aws/)

### 1.1 provider.tf

```hcl
provider "aws" {
  region = var.aws_region
}
````

### 1.2 variables.tf

```hcl
variable "aws_region"       { default = "us-east-1" }
variable "environment"      { default = "production" }
variable "db_password"      { type = string }
variable "supabase_url"     { type = string }
variable "supabase_anon_key"{ type = string }
variable "app_image_tag"    { default = "latest" }
```

### 1.3 main.tf

Defines:

* VPC, subnets, SGs
* RDS PostgreSQL
* ECR repository
* ECS cluster & service
* ALB with DNS

*(See `aws/main.tf` for full HCL.)*

### 1.4 outputs.tf

```hcl
output "alb_dns_name" {
  value = aws_lb.boxed_alb.dns_name
}

output "ecr_repo_url" {
  value = aws_ecr_repository.boxed_web.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.boxed.name
}

output "ecs_service_name" {
  value = aws_ecs_service.boxed.name
}
```

### 1.5 aws/deploy.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

ENV=${1:-production}
TAG=${2:-latest}

# Load aws/.env if present
[ -f .env ] && source .env

: "${AWS_REGION:?set AWS_REGION}"
: "${DB_PASSWORD:?set DB_PASSWORD}"
: "${SUPABASE_URL:?set SUPABASE_URL}"
: "${SUPABASE_ANON_KEY:?set SUPABASE_ANON_KEY}"

pushd "$(dirname "$0")"

echo "🌱 Terraform init"
terraform init -input=false

echo "📝 Terraform plan"
terraform plan \
  -var="aws_region=${AWS_REGION}" \
  -var="environment=${ENV}" \
  -var="db_password=${DB_PASSWORD}" \
  -var="supabase_url=${SUPABASE_URL}" \
  -var="supabase_anon_key=${SUPABASE_ANON_KEY}" \
  -var="app_image_tag=${TAG}" \
  -out=tfplan

echo "🚀 Terraform apply"
terraform apply -input=false tfplan

popd
```

Make it executable:

```bash
chmod +x aws/deploy.sh
```

---

## 🛠️ 2. Ansible (ansible/)

### 2.1 ansible.cfg

```ini
[defaults]
inventory = inventory/production.ini
host_key_checking = False
timeout = 30
forks = 10
```

### 2.2 Inventory

`ansible/inventory/production.ini`

```ini
[app_servers]
app1.boxed.example.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
app2.boxed.example.com ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/id_rsa
```

### 2.3 playbook.yml

```yaml
---
- name: Deploy Boxed Application
  hosts: app_servers
  become: true
  vars:
    aws_region: "{{ lookup('env','AWS_REGION') }}"
    supabase_url: "{{ lookup('env','SUPABASE_URL') }}"
    supabase_anon_key: "{{ lookup('env','SUPABASE_ANON_KEY') }}"
    environment: production
    app_image_tag: latest
  roles:
    - common
    - boxed-app
```

---

### 2.4 Role: common

#### vars/main.yml

```yaml
---
node_version: "18.x"
pm2_version: "latest"
nginx_conf_dest: "/etc/nginx/sites-available/boxed.conf"
```

#### tasks/main.yml

```yaml
---
- name: Install apt dependencies
  apt:
    name:
      - curl
      - nginx
    update_cache: true

- name: Install Node.js
  apt_key:
    url: https://deb.nodesource.com/gpgkey/nodesource.gpg.key
  register: _

- name: Add NodeSource repo
  apt_repository:
    repo: deb https://deb.nodesource.com/node_{{ node_version }} $(lsb_release -cs) main
  register: _

- name: Install Node.js & PM2
  apt:
    name:
      - nodejs
    update_cache: true

- name: Install PM2 globally
  npm:
    name: pm2@{{ pm2_version }}
    global: yes
```

---

### 2.5 Role: boxed-app

#### vars/main.yml

```yaml
---
app_name: "boxed-web"
deploy_dir: "/var/www/boxed"
docker_image: "{{ lookup('env','ACCOUNT_ID') }}.dkr.ecr.{{ aws_region }}.amazonaws.com/{{ environment }}-boxed-web:{{ app_image_tag }}"
```

#### tasks/main.yml

```yaml
---
- name: Ensure deploy dir exists
  file:
    path: "{{ deploy_dir }}"
    state: directory
    owner: www-data
    group: www-data
    mode: "0755"

- name: Pull Docker image
  docker_image:
    name: "{{ docker_image }}"
    source: pull

- name: Render nginx config
  template:
    src: nginx.conf.j2
    dest: "{{ nginx_conf_dest }}"
    owner: root
    group: root
    mode: "0644"

- name: Enable site
  file:
    src: "{{ nginx_conf_dest }}"
    dest: /etc/nginx/sites-enabled/boxed.conf
    state: link
    force: yes

- name: Restart Nginx
  service:
    name: nginx
    state: restarted

- name: Render PM2 service
  template:
    src: pm2.service.j2
    dest: /etc/systemd/system/pm2-boxed.service
    mode: "0644"

- name: Reload systemd
  systemd:
    daemon_reload: yes

- name: Ensure PM2 service running
  systemd:
    name: pm2-boxed
    state: started
    enabled: yes
```

---

## ▶️ Usage

1. **Terraform**

   ```bash
   cd aws
   ./deploy.sh production latest
   ```

2. **Ansible**

   ```bash
   cd ansible
   ansible-playbook playbook.yml
   ```

This will:

1. Provision AWS infra (VPC, RDS, ECR, ECS, ALB).
2. Build & publish Docker image to ECR.
3. SSH to each app server, pull image, configure Nginx + PM2, and start your Boxed web app.

---

**Enjoy your hosted, scalable Boxed deployment on AWS!**
