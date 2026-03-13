FROM maven:3-eclipse-temurin-17-alpine

WORKDIR /app

# Copy dependency descriptor
COPY pom.xml .

# Cache dependencies
RUN mvn -B -q -e dependency:go-offline

# Copy application code
COPY . .

EXPOSE 8080

CMD ["mvn", "spring-boot:run"]
