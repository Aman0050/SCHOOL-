# Cloud Architecture & Topology

## Overview
The School Management SaaS platform is designed for High Availability (HA) and Horizontal Scalability, capable of supporting 10,000+ schools and 500,000+ concurrent students globally.

## Cloud Provider Topology (AWS Target)

\\\mermaid
graph TD
    Client[Web/Mobile Clients] --> CDN[CloudFront CDN]
    CDN --> Route53[Route53 DNS]
    Route53 --> WAF[AWS WAF]
    WAF --> ALB[Application Load Balancer]
    
    subgraph VPC [Production VPC]
        subgraph PublicSubnet [Public Subnets - Multi AZ]
            ALB
            NATGateway[NAT Gateway]
        end
        
        subgraph AppSubnet [Private App Subnets - Multi AZ]
            AutoScaling[EKS / Auto Scaling Group]
            AutoScaling --> AppNode1[Node Instance 1]
            AutoScaling --> AppNode2[Node Instance 2]
            AutoScaling --> AppNodeN[Node Instance N]
            
            Queue[Background Job Workers]
        end
        
        subgraph DataSubnet [Private Data Subnets - Multi AZ]
            PrimaryDB[(Aurora PostgreSQL Primary)]
            ReplicaDB1[(Aurora Read Replica 1)]
            ReplicaDB2[(Aurora Read Replica 2)]
            
            Redis[ElastiCache Redis Cluster]
        end
    end
    
    ALB --> AutoScaling
    AppNode1 --> PrimaryDB
    AppNode1 --> ReplicaDB1
    AppNode1 --> Redis
    Queue --> PrimaryDB
    
    S3[S3 Storage Bucket]
    AppNode1 --> S3
\\\

## Component Details
1. **Edge Layer (CloudFront + WAF)**: Caches static React assets. WAF blocks SQLi, XSS, and bad bot traffic.
2. **Compute Layer (EKS or ECS)**: Stateless Node.js/Express application. Scales horizontally based on CPU/Memory and HTTP queue metrics.
3. **Database Layer (Aurora PostgreSQL)**: Multi-AZ setup with automatic failover. Write operations hit the primary, read operations are routed to read replicas.
4. **Caching Layer (ElastiCache Redis)**: Caches session data, global configs, and complex dashboard queries to reduce DB load.
5. **Storage (S3)**: Immutable, highly-available storage for homework attachments, report cards, and notices.