variable "env" {
  type        = string
  description = "Deployment environment (e.g. dev, prod)"
}

variable "region" {
  type        = string
  description = "AWS region"
  default     = "us-east-1"
}

variable "db_username" {
  type        = string
  description = "Postgres master username"
  default     = "boxed_admin"
}

variable "db_password" {
  type        = string
  description = "Postgres master password"
}

variable "desired_count" {
  type        = number
  description = "Number of Fargate tasks"
  default     = 2
}

variable "container_port" {
  type        = number
  default     = 3000
}
