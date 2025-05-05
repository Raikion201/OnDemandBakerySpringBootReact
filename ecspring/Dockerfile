FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy the POM file
COPY pom.xml .

# Download all required dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application with specific Maven compiler version matching your POM
RUN mvn package -DskipTests

# Create runtime image using Java 21
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Create a non-root user
RUN useradd -m springuser
USER springuser

# Set environment variables for Spring Boot
ENV SPRING_PROFILES_ACTIVE=production

# Start the application with optimized JVM settings for containers
ENTRYPOINT ["java", \
            "-XX:+UseContainerSupport", \
            "-XX:MaxRAMPercentage=75.0", \
            "-XX:InitialRAMPercentage=50.0", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-jar", "app.jar"]
