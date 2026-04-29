# ─── Stage 1: Build Spring Boot JAR ───────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom first for dependency caching
COPY pom.xml ./
COPY .mvn .mvn
COPY mvnw ./

RUN chmod +x mvnw && ./mvnw dependency:go-offline -q

# Copy source and build (skip tests — run separately in CI)
COPY src ./src
RUN ./mvnw package -DskipTests -q

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR
COPY --from=builder /app/target/appraisal-1.0.0.jar app.jar

# Directory for PDF storage (mounted as a volume in production)
RUN mkdir -p /app/appraisal-pdfs && chown -R appuser:appgroup /app

USER appuser

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
