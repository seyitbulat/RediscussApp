using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("gateway.json", optional: false, reloadOnChange: true);

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowReactDev", policy =>
	{
		policy.WithOrigins("http://localhost:3000")
			  .AllowAnyHeader()
			  .AllowAnyMethod();
	});
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
	options.SwaggerDoc("v1", new OpenApiInfo { Title = "Rediscuss API Gateway", Version = "v1" });
});

builder.Services.AddHttpForwarder();
builder.Services.AddReverseProxy()
				.LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
	c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gateway API");

	var proxyConfig = app.Configuration.GetSection("ReverseProxy");
	var clusters = proxyConfig.GetSection("Clusters").GetChildren();

	foreach (var cluster in clusters)
	{
		var swaggerMetadata = cluster.GetSection("Metadata:Swagger");
		if (swaggerMetadata.Exists())
		{
			var name = swaggerMetadata["Name"];
			var clusterId = cluster.Key;

			c.SwaggerEndpoint($"/swagger/{clusterId}/v1/swagger.json", name);
		}
	}
});

app.UseCors("AllowReactDev");
app.UseHttpsRedirection();

app.MapReverseProxy();

app.Run();