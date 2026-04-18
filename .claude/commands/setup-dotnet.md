# Setup .NET API Project

Khởi tạo dự án .NET Web API với Clean Architecture + CQRS pattern.

## Arguments

`$ARGUMENTS` — tên solution (PascalCase). Ví dụ: `/setup-dotnet MyApp`

## Architecture

```
Clean Architecture (4 layers):
  API (Presentation)  →  Controllers, Middleware, Filters, DI config
  Application         →  CQRS Commands/Queries (MediatR), DTOs, Validators, Interfaces
  Domain              →  Entities, Value Objects, Domain Events, Repository interfaces
  Infrastructure      →  EF Core, Repository impl, External services, Migrations
```

## Instructions

### 1. Tạo Solution & Projects

```bash
# Tạo solution
dotnet new sln -n $ARGUMENTS
mkdir $ARGUMENTS && cd $ARGUMENTS

# Tạo 4 projects
dotnet new webapi  -n $ARGUMENTS.API           -o src/$ARGUMENTS.API
dotnet new classlib -n $ARGUMENTS.Application  -o src/$ARGUMENTS.Application
dotnet new classlib -n $ARGUMENTS.Domain       -o src/$ARGUMENTS.Domain
dotnet new classlib -n $ARGUMENTS.Infrastructure -o src/$ARGUMENTS.Infrastructure

# Test project
dotnet new xunit   -n $ARGUMENTS.Tests         -o tests/$ARGUMENTS.Tests

# Thêm vào solution
dotnet sln add src/$ARGUMENTS.API/$ARGUMENTS.API.csproj
dotnet sln add src/$ARGUMENTS.Application/$ARGUMENTS.Application.csproj
dotnet sln add src/$ARGUMENTS.Domain/$ARGUMENTS.Domain.csproj
dotnet sln add src/$ARGUMENTS.Infrastructure/$ARGUMENTS.Infrastructure.csproj
dotnet sln add tests/$ARGUMENTS.Tests/$ARGUMENTS.Tests.csproj
```

### 2. Project References

```bash
# Application depends on Domain
dotnet add src/$ARGUMENTS.Application/$ARGUMENTS.Application.csproj reference \
  src/$ARGUMENTS.Domain/$ARGUMENTS.Domain.csproj

# Infrastructure depends on Application + Domain
dotnet add src/$ARGUMENTS.Infrastructure/$ARGUMENTS.Infrastructure.csproj reference \
  src/$ARGUMENTS.Application/$ARGUMENTS.Application.csproj \
  src/$ARGUMENTS.Domain/$ARGUMENTS.Domain.csproj

# API depends on Application + Infrastructure
dotnet add src/$ARGUMENTS.API/$ARGUMENTS.API.csproj reference \
  src/$ARGUMENTS.Application/$ARGUMENTS.Application.csproj \
  src/$ARGUMENTS.Infrastructure/$ARGUMENTS.Infrastructure.csproj

# Tests
dotnet add tests/$ARGUMENTS.Tests/$ARGUMENTS.Tests.csproj reference \
  src/$ARGUMENTS.Application/$ARGUMENTS.Application.csproj
```

### 3. NuGet Packages

```bash
# Application
dotnet add src/$ARGUMENTS.Application package MediatR
dotnet add src/$ARGUMENTS.Application package FluentValidation
dotnet add src/$ARGUMENTS.Application package FluentValidation.DependencyInjectionExtensions
dotnet add src/$ARGUMENTS.Application package AutoMapper
dotnet add src/$ARGUMENTS.Application package Microsoft.Extensions.Logging.Abstractions

# Infrastructure
dotnet add src/$ARGUMENTS.Infrastructure package Microsoft.EntityFrameworkCore
dotnet add src/$ARGUMENTS.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer
dotnet add src/$ARGUMENTS.Infrastructure package Microsoft.EntityFrameworkCore.Design
dotnet add src/$ARGUMENTS.Infrastructure package Microsoft.EntityFrameworkCore.Tools
dotnet add src/$ARGUMENTS.Infrastructure package Serilog.AspNetCore
dotnet add src/$ARGUMENTS.Infrastructure package Serilog.Sinks.Console
dotnet add src/$ARGUMENTS.Infrastructure package Serilog.Sinks.File

# API
dotnet add src/$ARGUMENTS.API package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add src/$ARGUMENTS.API package Swashbuckle.AspNetCore
dotnet add src/$ARGUMENTS.API package Microsoft.AspNetCore.OpenApi

# Tests
dotnet add tests/$ARGUMENTS.Tests package Moq
dotnet add tests/$ARGUMENTS.Tests package FluentAssertions
dotnet add tests/$ARGUMENTS.Tests package Microsoft.EntityFrameworkCore.InMemory
```

### 4. Cấu trúc thư mục — tạo toàn bộ

```
src/
├── $ARGUMENTS.Domain/
│   ├── Common/
│   │   ├── BaseEntity.cs
│   │   ├── BaseAuditableEntity.cs
│   │   └── IDomainEvent.cs
│   ├── Entities/
│   │   └── User.cs                    ← entity mẫu
│   ├── Enums/
│   ├── Exceptions/
│   │   └── DomainException.cs
│   └── Interfaces/
│       └── IRepository.cs
│
├── $ARGUMENTS.Application/
│   ├── Common/
│   │   ├── Behaviours/
│   │   │   ├── ValidationBehaviour.cs
│   │   │   └── LoggingBehaviour.cs
│   │   ├── Exceptions/
│   │   │   ├── NotFoundException.cs
│   │   │   └── ValidationException.cs
│   │   ├── Interfaces/
│   │   │   ├── IApplicationDbContext.cs
│   │   │   └── ICurrentUserService.cs
│   │   └── Mappings/
│   │       └── MappingProfile.cs
│   ├── Features/
│   │   └── Users/                     ← feature mẫu
│   │       ├── Commands/
│   │       │   └── CreateUser/
│   │       │       ├── CreateUserCommand.cs
│   │       │       ├── CreateUserCommandHandler.cs
│   │       │       └── CreateUserCommandValidator.cs
│   │       ├── Queries/
│   │       │   └── GetUsers/
│   │       │       ├── GetUsersQuery.cs
│   │       │       ├── GetUsersQueryHandler.cs
│   │       │       └── UserDto.cs
│   │       └── EventHandlers/
│   └── DependencyInjection.cs
│
├── $ARGUMENTS.Infrastructure/
│   ├── Persistence/
│   │   ├── ApplicationDbContext.cs
│   │   ├── Configurations/
│   │   │   └── UserConfiguration.cs
│   │   └── Repositories/
│   │       └── Repository.cs
│   ├── Identity/
│   │   └── JwtTokenService.cs
│   ├── Services/
│   └── DependencyInjection.cs
│
└── $ARGUMENTS.API/
    ├── Controllers/
    │   ├── BaseApiController.cs
    │   └── UsersController.cs
    ├── Middleware/
    │   ├── ExceptionHandlingMiddleware.cs
    │   └── RequestLoggingMiddleware.cs
    ├── Filters/
    │   └── ApiExceptionFilterAttribute.cs
    ├── appsettings.json
    ├── appsettings.Development.json
    └── Program.cs

tests/
└── $ARGUMENTS.Tests/
    ├── Application/
    │   └── Users/
    │       └── CreateUserCommandTests.cs
    └── Common/
        └── TestBase.cs
```

### 5. Domain layer

**`src/$ARGUMENTS.Domain/Common/BaseEntity.cs`**
```csharp
namespace $ARGUMENTS.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();

    private readonly List<IDomainEvent> _domainEvents = [];
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected void AddDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();
}
```

**`src/$ARGUMENTS.Domain/Common/BaseAuditableEntity.cs`**
```csharp
namespace $ARGUMENTS.Domain.Common;

public abstract class BaseAuditableEntity : BaseEntity
{
    public DateTimeOffset CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
```

**`src/$ARGUMENTS.Domain/Common/IDomainEvent.cs`**
```csharp
using MediatR;
namespace $ARGUMENTS.Domain.Common;

public interface IDomainEvent : INotification { }
```

**`src/$ARGUMENTS.Domain/Exceptions/DomainException.cs`**
```csharp
namespace $ARGUMENTS.Domain.Exceptions;

public class DomainException(string message) : Exception(message);
```

**`src/$ARGUMENTS.Domain/Interfaces/IRepository.cs`**
```csharp
using System.Linq.Expressions;
using $ARGUMENTS.Domain.Common;

namespace $ARGUMENTS.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default);
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
    Task AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
```

**`src/$ARGUMENTS.Domain/Entities/User.cs`**
```csharp
using $ARGUMENTS.Domain.Common;

namespace $ARGUMENTS.Domain.Entities;

public class User : BaseAuditableEntity
{
    public string Email { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;

    private User() { }

    public static User Create(string email, string fullName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(fullName);

        return new User { Email = email.ToLowerInvariant(), FullName = fullName };
    }

    public void Update(string fullName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fullName);
        FullName = fullName;
    }

    public void Deactivate() => IsActive = false;
}
```

### 6. Application layer

**`src/$ARGUMENTS.Application/Common/Interfaces/IApplicationDbContext.cs`**
```csharp
using Microsoft.EntityFrameworkCore;
using $ARGUMENTS.Domain.Entities;

namespace $ARGUMENTS.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

**`src/$ARGUMENTS.Application/Common/Exceptions/NotFoundException.cs`**
```csharp
namespace $ARGUMENTS.Application.Common.Exceptions;

public class NotFoundException(string name, object key)
    : Exception($"Entity \"{name}\" ({key}) was not found.");
```

**`src/$ARGUMENTS.Application/Common/Behaviours/ValidationBehaviour.cs`**
```csharp
using FluentValidation;
using MediatR;

namespace $ARGUMENTS.Application.Common.Behaviours;

public sealed class ValidationBehaviour<TRequest, TResponse>(
    IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!validators.Any()) return await next();

        var context = new ValidationContext<TRequest>(request);
        var result = await Task.WhenAll(validators.Select(v => v.ValidateAsync(context, ct)));
        var failures = result.SelectMany(r => r.Errors).Where(f => f is not null).ToList();

        if (failures.Count != 0) throw new ValidationException(failures);

        return await next();
    }
}
```

**`src/$ARGUMENTS.Application/Common/Behaviours/LoggingBehaviour.cs`**
```csharp
using MediatR;
using Microsoft.Extensions.Logging;

namespace $ARGUMENTS.Application.Common.Behaviours;

public sealed class LoggingBehaviour<TRequest, TResponse>(
    ILogger<LoggingBehaviour<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var name = typeof(TRequest).Name;
        logger.LogInformation("Handling {RequestName}: {@Request}", name, request);
        var response = await next();
        logger.LogInformation("Handled {RequestName}", name);
        return response;
    }
}
```

**`src/$ARGUMENTS.Application/Features/Users/Commands/CreateUser/CreateUserCommand.cs`**
```csharp
using MediatR;

namespace $ARGUMENTS.Application.Features.Users.Commands.CreateUser;

public record CreateUserCommand(string Email, string FullName) : IRequest<Guid>;
```

**`src/$ARGUMENTS.Application/Features/Users/Commands/CreateUser/CreateUserCommandValidator.cs`**
```csharp
using FluentValidation;

namespace $ARGUMENTS.Application.Features.Users.Commands.CreateUser;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().EmailAddress().MaximumLength(256);

        RuleFor(x => x.FullName)
            .NotEmpty().MaximumLength(100);
    }
}
```

**`src/$ARGUMENTS.Application/Features/Users/Commands/CreateUser/CreateUserCommandHandler.cs`**
```csharp
using MediatR;
using $ARGUMENTS.Application.Common.Interfaces;
using $ARGUMENTS.Domain.Entities;

namespace $ARGUMENTS.Application.Features.Users.Commands.CreateUser;

public sealed class CreateUserCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateUserCommand, Guid>
{
    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var user = User.Create(request.Email, request.FullName);
        await context.Users.AddAsync(user, ct);
        await context.SaveChangesAsync(ct);
        return user.Id;
    }
}
```

**`src/$ARGUMENTS.Application/Features/Users/Queries/GetUsers/GetUsersQuery.cs`**
```csharp
using MediatR;

namespace $ARGUMENTS.Application.Features.Users.Queries.GetUsers;

public record GetUsersQuery : IRequest<List<UserDto>>;

public record UserDto(Guid Id, string Email, string FullName, bool IsActive);
```

**`src/$ARGUMENTS.Application/Features/Users/Queries/GetUsers/GetUsersQueryHandler.cs`**
```csharp
using MediatR;
using Microsoft.EntityFrameworkCore;
using $ARGUMENTS.Application.Common.Interfaces;

namespace $ARGUMENTS.Application.Features.Users.Queries.GetUsers;

public sealed class GetUsersQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken ct) =>
        await context.Users
            .Where(u => u.IsActive)
            .Select(u => new UserDto(u.Id, u.Email, u.FullName, u.IsActive))
            .ToListAsync(ct);
}
```

**`src/$ARGUMENTS.Application/DependencyInjection.cs`**
```csharp
using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using $ARGUMENTS.Application.Common.Behaviours;

namespace $ARGUMENTS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehaviour<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
        });

        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        services.AddAutoMapper(Assembly.GetExecutingAssembly());

        return services;
    }
}
```

### 7. Infrastructure layer

**`src/$ARGUMENTS.Infrastructure/Persistence/ApplicationDbContext.cs`**
```csharp
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using $ARGUMENTS.Application.Common.Interfaces;
using $ARGUMENTS.Domain.Entities;

namespace $ARGUMENTS.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
        base.OnModelCreating(builder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // Auto-set audit fields
        foreach (var entry in ChangeTracker.Entries<$ARGUMENTS.Domain.Common.BaseAuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTimeOffset.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTimeOffset.UtcNow;
                    break;
            }
        }
        return base.SaveChangesAsync(ct);
    }
}
```

**`src/$ARGUMENTS.Infrastructure/Persistence/Configurations/UserConfiguration.cs`**
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using $ARGUMENTS.Domain.Entities;

namespace $ARGUMENTS.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).HasMaxLength(256).IsRequired();
        builder.Property(u => u.FullName).HasMaxLength(100).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();
    }
}
```

**`src/$ARGUMENTS.Infrastructure/DependencyInjection.cs`**
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using $ARGUMENTS.Infrastructure.Persistence;

namespace $ARGUMENTS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IApplicationDbContext>(p =>
            p.GetRequiredService<ApplicationDbContext>());

        return services;
    }

    public static IHostBuilder AddSerilog(this IHostBuilder host) =>
        host.UseSerilog((ctx, lc) => lc
            .ReadFrom.Configuration(ctx.Configuration)
            .WriteTo.Console()
            .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));
}
```

### 8. API layer

**`src/$ARGUMENTS.API/Controllers/BaseApiController.cs`**
```csharp
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace $ARGUMENTS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseApiController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator =>
        _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();
}
```

**`src/$ARGUMENTS.API/Controllers/UsersController.cs`**
```csharp
using Microsoft.AspNetCore.Mvc;
using $ARGUMENTS.Application.Features.Users.Commands.CreateUser;
using $ARGUMENTS.Application.Features.Users.Queries.GetUsers;

namespace $ARGUMENTS.API.Controllers;

public class UsersController : BaseApiController
{
    /// <summary>Lấy danh sách users</summary>
    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsers(CancellationToken ct) =>
        Ok(await Mediator.Send(new GetUsersQuery(), ct));

    /// <summary>Tạo user mới</summary>
    [HttpPost]
    public async Task<ActionResult<Guid>> CreateUser(
        CreateUserCommand command, CancellationToken ct)
    {
        var id = await Mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetUsers), new { id }, id);
    }
}
```

**`src/$ARGUMENTS.API/Middleware/ExceptionHandlingMiddleware.cs`**
```csharp
using System.Net;
using System.Text.Json;
using FluentValidation;
using $ARGUMENTS.Application.Common.Exceptions;

namespace $ARGUMENTS.API.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (status, message, errors) = exception switch
        {
            NotFoundException e => (HttpStatusCode.NotFound, e.Message, (object?)null),
            ValidationException e => (HttpStatusCode.UnprocessableEntity, "Validation failed",
                e.Errors.Select(x => new { x.PropertyName, x.ErrorMessage })),
            _ => (HttpStatusCode.InternalServerError, "An error occurred", null)
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)status;

        var result = JsonSerializer.Serialize(new { status = (int)status, message, errors });
        return context.Response.WriteAsync(result);
    }
}
```

**`src/$ARGUMENTS.API/Program.cs`**
```csharp
using Serilog;
using $ARGUMENTS.Application;
using $ARGUMENTS.Infrastructure;
using $ARGUMENTS.API.Middleware;
using $ARGUMENTS.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Logging
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day));

// Layers
builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

// API
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "$ARGUMENTS API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
});

builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();

var app = builder.Build();

// Auto migrate on startup (dev only)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseSerilogRequestLogging();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**`src/$ARGUMENTS.API/appsettings.json`**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=$ARGUMENTSDb;Trusted_Connection=True;"
  },
  "Authentication": {
    "Schemes": {
      "Bearer": {
        "Authority": "https://your-identity-server",
        "ValidAudiences": ["$ARGUMENTS.API"]
      }
    }
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  },
  "AllowedHosts": "*"
}
```

### 9. Test mẫu

**`tests/$ARGUMENTS.Tests/Application/Users/CreateUserCommandTests.cs`**
```csharp
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using $ARGUMENTS.Application.Features.Users.Commands.CreateUser;
using $ARGUMENTS.Infrastructure.Persistence;

namespace $ARGUMENTS.Tests.Application.Users;

public class CreateUserCommandTests
{
    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldCreateUser()
    {
        // Arrange
        using var context = CreateContext();
        var handler = new CreateUserCommandHandler(context);
        var command = new CreateUserCommand("test@example.com", "Test User");

        // Act
        var id = await handler.Handle(command, CancellationToken.None);

        // Assert
        id.Should().NotBeEmpty();
        var user = await context.Users.FindAsync(id);
        user.Should().NotBeNull();
        user!.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task Handle_DuplicateEmail_ShouldThrow()
    {
        using var context = CreateContext();
        var handler = new CreateUserCommandHandler(context);
        var command = new CreateUserCommand("dup@example.com", "User");

        await handler.Handle(command, CancellationToken.None);

        await Assert.ThrowsAnyAsync<Exception>(() =>
            handler.Handle(command, CancellationToken.None));
    }
}
```

### 10. EF Migration & chạy

```bash
# Tạo migration đầu tiên
dotnet ef migrations add InitialCreate \
  --project src/$ARGUMENTS.Infrastructure \
  --startup-project src/$ARGUMENTS.API

# Apply migration
dotnet ef database update \
  --project src/$ARGUMENTS.Infrastructure \
  --startup-project src/$ARGUMENTS.API

# Chạy
dotnet run --project src/$ARGUMENTS.API
```

### 11. Thông báo cho user

Sau khi setup xong, thông báo:
- Danh sách file đã tạo
- URL Swagger: `https://localhost:PORT/swagger`
- Cách thêm feature mới: tạo thư mục `Application/Features/[FeatureName]/` với Commands + Queries
- Pattern CQRS: Command (write) → IRequest<T>, Query (read) → IRequest<List<T>>
- Đăng ký service mới trong `Infrastructure/DependencyInjection.cs`
- Thêm entity mới: tạo trong Domain → thêm DbSet vào IApplicationDbContext + ApplicationDbContext → tạo Configuration → Migration
