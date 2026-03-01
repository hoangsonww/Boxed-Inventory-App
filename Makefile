# ─── Variables ────────────────────────────────────────────────────────────────
TF_DIR := aws
ENV ?= dev

# ─── Local Docker targets ─────────────────────────────────────────────────────
.PHONY: build-image
build-image:
	docker build --target runner -t boxed-web:latest -f Dockerfile .

.PHONY: compose-up
compose-up:
	docker-compose up --build -d

.PHONY: compose-down
compose-down:
	docker-compose down

# ─── Terraform targets ────────────────────────────────────────────────────────
.PHONY: infra-init
infra-init:
	cd $(TF_DIR) && terraform init

.PHONY: infra-plan
infra-plan:
	cd $(TF_DIR) && terraform plan -var="env=$(ENV)"

.PHONY: infra-apply
infra-apply:
	cd $(TF_DIR) && terraform apply -auto-approve -var="env=$(ENV)"

.PHONY: infra-destroy
infra-destroy:
	cd $(TF_DIR) && terraform destroy -auto-approve -var="env=$(ENV)"

.PHONY: show-runtime-info
show-runtime-info:
	@echo "Node: $$(node --version 2>/dev/null || echo unavailable)"
	@echo "npm: $$(npm --version 2>/dev/null || echo unavailable)"
	@echo "Python: $$(python3 --version 2>/dev/null || python --version 2>/dev/null || echo unavailable)"
