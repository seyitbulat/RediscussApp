using MassTransit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Rediscuss.ForumService.Consumers;
using Rediscuss.ForumService.Data;
using Rediscuss.Shared.Contracts;
using Rediscuss.Shared.Contracts.Middlewares;
using StackExchange.Redis;
using System.Security.Claims;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle



builder.Services.AddMassTransit(config =>
{

	config.AddConsumers(typeof(Program).Assembly);
	config.UsingRabbitMq((ctx, cfg) =>
	{
		var host = builder.Configuration.GetSection("RabbitMqConnection:Host").Value;
		var username = builder.Configuration.GetSection("RabbitMqConnection:Username").Value;
		var password = builder.Configuration.GetSection("RabbitMqConnection:Password").Value;
		cfg.Host(host, "/", h => { h.Username(username); h.Password(password); });

		cfg.ReceiveEndpoint("user-created-event-queue", e =>
		{
			e.ConfigureConsumer<UserCreatedConsumer>(ctx);
		});
	});
});


builder.Services.AddControllers();

builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
	.AddJwtBearer(options =>
	{
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidateAudience = true,
			ValidateLifetime = true,
			ValidateIssuerSigningKey = true,
			ValidIssuer = builder.Configuration["Jwt:Issuer"],
			ValidAudience = builder.Configuration["Jwt:Audience"],
			IssuerSigningKey = new SymmetricSecurityKey(Convert.FromBase64String(builder.Configuration["Jwt:Key"])),
			RoleClaimType = ClaimTypes.Role
		};

		options.Events = new JwtBearerEvents
		{
			OnChallenge = async context =>
			{
				context.HandleResponse();
				context.Response.StatusCode = StatusCodes.Status401Unauthorized;
				context.Response.ContentType = "application/json";

				var error = new ApiError { Status = "401", Title = "Unauthorized", Detail = "Bu iþlemi yapmak için giriþ yapmanýz gerekmektedir." };
				var response = StandardApiResponse<object>.Fail(new List<ApiError> { error });

				await context.Response.WriteAsJsonAsync(response);
			},

			OnForbidden = async context =>
			{
				context.Response.StatusCode = StatusCodes.Status403Forbidden;
				context.Response.ContentType = "application/json";

				var error = new ApiError { Status = "403", Title = "Forbidden", Detail = "Bu iþlemi gerçekleþtirmek için gerekli yetkiye sahip deðilsiniz." };
				var response = StandardApiResponse<object>.Fail(new List<ApiError> { error });

				await context.Response.WriteAsJsonAsync(response);
			}
		};
	});


builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(setup =>
{
	var jwtSecurityScheme = new OpenApiSecurityScheme
	{
		BearerFormat = "JWT",
		Name = "JWT Authentication",
		In = ParameterLocation.Header,
		Type = SecuritySchemeType.Http,
		Scheme = JwtBearerDefaults.AuthenticationScheme,
		Reference = new OpenApiReference { Id = JwtBearerDefaults.AuthenticationScheme, Type = ReferenceType.SecurityScheme }
	};

	setup.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
	setup.AddSecurityRequirement(new OpenApiSecurityRequirement
	{
		{
			new OpenApiSecurityScheme
			{
				Reference = new OpenApiReference
				{
					Type = ReferenceType.SecurityScheme,
					Id = "Bearer"
				}
			},
			Array.Empty<string>()
		}
	});
});

builder.Services.AddSingleton<ForumContext>();

builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
	var connectionString = builder.Configuration["RedisConnectionString"];
	return ConnectionMultiplexer.Connect(connectionString);
});


var app = builder.Build();

app.UseMiddleware<GlobalErrorHandling>();


using (var scope = app.Services.CreateScope())
{
	var dbService = app.Services.GetRequiredService<ForumContext>();
	var seeder = new Seeder(dbService);
	await seeder.DbInitialize();
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
