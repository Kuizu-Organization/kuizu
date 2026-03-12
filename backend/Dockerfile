FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy wrapper first
COPY .mvn .mvn
COPY mvnw .

# Copy dependency descriptor
COPY pom.xml .

# Cache dependencies
RUN ./mvnw -B -q dependency:go-offline

# Copy application code
COPY src src

EXPOSE 8080

CMD ["./mvnw", "spring-boot:run"]
