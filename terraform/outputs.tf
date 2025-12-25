# Terraform Outputs
# These outputs provide information about created resources

output "backend_service_id" {
  description = "Instance ID of the Backend Service"
  value       = aws_instance.backend_service.id
}

output "backend_service_public_ip" {
  description = "Public IP of the Backend Service"
  value       = aws_instance.backend_service.public_ip
}

output "ai_service_id" {
  description = "Instance ID of the AI Service"
  value       = aws_instance.ai_service.id
}

output "ai_service_public_ip" {
  description = "Public IP of the AI Service"
  value       = aws_instance.ai_service.public_ip
}

output "blockchain_service_id" {
  description = "Instance ID of the Blockchain Service"
  value       = aws_instance.blockchain_service.id
}

output "blockchain_service_public_ip" {
  description = "Public IP of the Blockchain Service"
  value       = aws_instance.blockchain_service.public_ip
}

output "all_service_instances" {
  description = "Map of all service instances"
  value = {
    backend    = aws_instance.backend_service.id
    ai         = aws_instance.ai_service.id
    blockchain = aws_instance.blockchain_service.id
  }
}

