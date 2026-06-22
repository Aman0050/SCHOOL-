# Enterprise Monitoring & Logging

## Centralized Logging (ELK / CloudWatch)
All application logs are streamed synchronously to centralized log aggregators.
- **Structured JSON Logging**: Winston generates structured logs.
- **Correlation IDs**: Every incoming HTTP request is tagged with an x-request-id which is passed through to the database layer to track the lifecycle of a request.
- **Audit Trails**: All modifications to Fee Management, Grades, and Users are recorded in the AuditLog table.

## Telemetry & Alerting (Prometheus & Grafana / Datadog)
- **Infrastructure Metrics**: CPU, Memory, Disk IOPS, Network In/Out.
- **Application Metrics**: API latency (p95, p99), Error Rates (5xx, 4xx), Connection Pool exhaustion.
- **Business Metrics**: Payment failures, Login failures, Active Users.

### Alert Escalation Matrix
- **Critical (P1 - Page On-Call)**: 5xx Error Rate > 5%, API Latency > 2s, Database CPU > 90%.
- **High (P2 - Slack Alert)**: High login failure rate, Payment gateway timeout spikes.
- **Low (P3 - Email)**: Background job queue backing up.