FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar archivos de proyecto
COPY ["AltairisBackoffice.API/AltairisBackoffice.API.csproj", "AltairisBackoffice.API/"]
COPY ["AltairisBackoffice.Core/AltairisBackoffice.Core.csproj", "AltairisBackoffice.Core/"]
COPY ["AltairisBackoffice.Infrastructure/AltairisBackoffice.Infrastructure.csproj", "AltairisBackoffice.Infrastructure/"]

# Restaurar dependencias (aprovechando caché de Docker)
RUN dotnet restore "AltairisBackoffice.API/AltairisBackoffice.API.csproj"

# Copiar todo el código fuente
COPY . .

# Compilar y publicar
WORKDIR "/src/AltairisBackoffice.API"
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Imagen de runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Crear usuario no root por seguridad
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

EXPOSE 8080

ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build --chown=appuser /app/publish .

ENTRYPOINT ["dotnet", "AltairisBackoffice.API.dll"]