# Disaster Recovery & Backup Strategy

## Recovery Objectives
- **Recovery Time Objective (RTO)**: ≤ 30 Minutes
- **Recovery Point Objective (RPO)**: ≤ 5 Minutes

## Backup Lifecycle
1. **Database (Aurora PostgreSQL)**
   - Continuous replication to multi-AZ standbys.
   - Automated continuous backups allowing Point-In-Time Recovery (PITR) up to 35 days.
   - Monthly snapshots copied to a separate AWS region for geographic redundancy.
2. **File Storage (S3)**
   - Cross-Region Replication (CRR) enabled on the production bucket.
   - Object Versioning enabled to protect against ransomware/accidental deletion.

## Failure Scenarios & Mitigation
- **Primary Database Failure**: Automatic failover to the Multi-AZ standby replica. Typical downtime < 60 seconds.
- **Region Outage**: Route53 automatically fails over traffic to the secondary region. Global Database cluster promotes secondary region to primary.
- **Data Corruption**: Initiate PITR to restore the database to the exact minute before the corruption occurred.