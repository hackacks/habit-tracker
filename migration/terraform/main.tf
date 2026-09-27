terraform {
  backend "s3" {
    bucket         = "state-bucket-ji0qu"
    key            = "habit-tracker-migration/terraform.tfstate"
    use_lockfile     = true
    region         = "ap-south-1"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
  required_version = ">= 1.16.0"
}

provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

data "aws_route53_zone" "hackack-tech" {
  name         = var.domain_name
  private_zone = false
}

data "aws_acm_certificate" "my_certificate" {
  domain   = var.domain_name
  provider = aws.us-east-1
  statuses = ["ISSUED"]
}

resource "aws_s3_bucket" "my_bucket" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "my_bucket_public_access_block" {
  bucket = aws_s3_bucket.my_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Copy the index.html and error.html files to the S3 bucket from migration folder
resource "aws_s3_object" "index_html" {
  bucket       = aws_s3_bucket.my_bucket.id
  key          = "index.html"
  source       = "${path.module}/../index.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/../index.html")
}

resource "aws_s3_object" "error_html" {
  bucket       = aws_s3_bucket.my_bucket.id
  key          = "error.html"
  source       = "${path.module}/../error.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/../error.html")
}

resource "aws_s3_object" "favicon" {
  bucket       = aws_s3_bucket.my_bucket.id
  key          = "favicon.ico"
  source       = "${path.module}/../favicon.ico"
  content_type = "image/x-icon"
  etag         = filemd5("${path.module}/../favicon.ico")
}


resource "aws_cloudfront_origin_access_control" "my_oac" {
  name                              = var.oac_name
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
  origin_access_control_origin_type = "s3"
}

#creat a cloudfront distribution to serve the S3 bucket content
resource "aws_cloudfront_distribution" "my_distribution" {
  origin {
    domain_name              = aws_s3_bucket.my_bucket.bucket_regional_domain_name
    origin_id                = var.bucket_name
    origin_access_control_id = aws_cloudfront_origin_access_control.my_oac.id
  }
  aliases = [var.subdomain]

  enabled             = true
  is_ipv6_enabled     = false
  default_root_object = "index.html"
  comment             = "CloudFront distribution for my habit tracker migration notice"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = var.bucket_name
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.my_certificate.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/error.html"
  }
}

#create a route53 record to point to the S3 bucket
resource "aws_route53_record" "my_bucket_record" {
  zone_id = data.aws_route53_zone.hackack-tech.zone_id
  name    = var.subdomain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.my_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.my_distribution.hosted_zone_id
    evaluate_target_health = false
  }
}

# Allow public GET only for .html objects for cloudfront to access the S3 bucket content
resource "aws_s3_bucket_policy" "my_bucket_policy" {
  bucket = aws_s3_bucket.my_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Sid    = "AllowCloudFrontRead"
        Effect = "Allow"

        Principal = {
          Service = "cloudfront.amazonaws.com"
        }

        Action = "s3:GetObject"

        Resource = "${aws_s3_bucket.my_bucket.arn}/*"


        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.my_distribution.arn
          }
        }
      }
    ]
  })

  depends_on = [
    aws_cloudfront_distribution.my_distribution
  ]
}