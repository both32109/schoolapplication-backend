# Terraform Configuration for Mock Infrastructure Services
# This file defines three mock services: Backend, AI, and Blockchain

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure AWS Provider (using mock/default region)
provider "aws" {
  region = var.aws_region
}

# Backend Service - Mock EC2 Instance
resource "aws_instance" "backend_service" {
  ami           = var.backend_ami_id
  instance_type = var.instance_type
  
  tags = {
    Name        = "backend-service"
    Service     = "backend"
    Environment = var.environment
  }
}

# AI Service - Mock EC2 Instance
resource "aws_instance" "ai_service" {
  ami           = var.ai_ami_id
  instance_type = var.instance_type
  
  tags = {
    Name        = "ai-service"
    Service     = "ai"
    Environment = var.environment
  }
}

# Blockchain Service - Mock EC2 Instance
resource "aws_instance" "blockchain_service" {
  ami           = var.blockchain_ami_id
  instance_type = var.instance_type
  
  tags = {
    Name        = "blockchain-service"
    Service     = "blockchain"
    Environment = var.environment
  }
}

