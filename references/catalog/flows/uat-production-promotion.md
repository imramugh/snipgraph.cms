# flow.uat-production-promotion.v1

Build one immutable, versioned container image. Back up each target database
before a schema migration. Deploy the image to UAT, wait for container health,
then verify the public site, authentication discovery, MCP scope challenges,
database migration, and representative editor behavior. Promote the exact image
ID to production only after UAT passes.

Production deployment repeats health and smoke checks. Daily custom-format
database backups are validated at creation, retained according to policy, and
periodically restored into an isolated temporary database. Cleanup targets only
unused, project-labelled image layers and never active containers or data
volumes.

