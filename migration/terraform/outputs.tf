output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.my_distribution.id
}

output "cloudfront_distribution_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.my_distribution.domain_name
}


output "website_url" {
  description = "The URL of the website"
  value       = "https://${var.subdomain}"
}
