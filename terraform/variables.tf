# Terraform Variables
# These variables allow customization of the infrastructure

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "demo"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

# Mock AMI IDs - These are placeholder values for demonstration
variable "backend_ami_id" {
  description = "AMI ID for Backend Service"
  type        = string
  default     = "ami-0123456789abcdef0"  # Mock AMI ID
}

variable "ai_ami_id" {
  description = "AMI ID for AI Service"
  type        = string
  default     = "ami-abcdef0123456789"  # Mock AMI ID
}

variable "blockchain_ami_id" {
  description = "AMI ID for Blockchain Service"
  type        = string
  default     = "ami-9876543210fedcba"  # Mock AMI ID
}

