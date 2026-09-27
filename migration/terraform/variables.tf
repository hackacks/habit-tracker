variable "aws_region" {
  description = "Region for my migration S3 bucket"
  type        = string
}

variable "domain_name" {
  description = "My root domain in Route 53/ACM"
  type        = string
}

variable "subdomain" {
  description = "My live app URL showing the notice"
  type        = string
}

variable "bucket_name" {
  description = "S3 bucket storing my notice HTML"
  type        = string
}

variable "oac_name" {
  description = "CloudFront OAC for private access to my S3 bucket."
  type        = string
}
