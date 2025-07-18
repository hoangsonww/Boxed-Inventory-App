output "alb_dns_name" {
  description = "Public DNS of the application load balancer"
  value       = aws_lb.app.dns_name
}

output "db_address" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.address
}
