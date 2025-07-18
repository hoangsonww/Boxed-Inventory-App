FROM postgres:15-alpine

# If you have any custom .sql or .sh in database/initdb, copy them:
# COPY initdb /docker-entrypoint-initdb.d/

# Environment defaults (override via Kubernetes Secret)
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=boxed_db

EXPOSE 5432

# Use official entrypoint
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["postgres"]
