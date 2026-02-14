using AltairisBackoffice.Core.Interfaces;
using AltairisBackoffice.Infrastructure.Data;
using AltairisBackoffice.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Altairis Backoffice API",
        Version = "v1",
        Description = "API para la gestión de hoteles, habitaciones, inventario y reservas",
        Contact = new OpenApiContact
        {
            Name = "Viajes Altairis",
            Email = "info@altairis.com"
        }
    });
});

// Configurar DbContext con PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Registrar repositorios
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IHotelRepository, HotelRepository>();
builder.Services.AddScoped<IRoomTypeRepository, RoomTypeRepository>();
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Altairis Backoffice API V1");
    });
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();

        logger.LogInformation("Creando base de datos...");
        dbContext.Database.EnsureCreated();

        logger.LogInformation("Inicializando datos...");
        DbInitializer.Initialize(dbContext);

        logger.LogInformation("Base de datos inicializada correctamente");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error inicializando la base de datos");
    }
}

app.Run();