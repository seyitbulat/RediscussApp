using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Rediscuss.Shared.Contracts.Middlewares
{
	public class GlobalErrorHandling
	{
		private readonly RequestDelegate _next;

		public GlobalErrorHandling(RequestDelegate next)
		{
			_next = next;
		}

		public async Task Invoke(HttpContext context)
		{
			try
			{
				await _next(context);
			}
			catch (Exception ex)
			{
				await HandleErrorException(context, ex);
			}
		}


		private static async Task HandleErrorException(HttpContext context, Exception exception)
		{
			context.Response.ContentType = "application/json";
			context.Response.StatusCode = (int)StatusCodes.Status500InternalServerError;

			var error = new ApiError { Status = "500", Title = "Server Hatası", Detail = "Beklenmedik bir hata oluştu. Lütfen sonra tekrar deneyin." };

			var response = StandardApiResponse<object>.Fail(new List<ApiError> { error });

			var jsonResponse = JsonSerializer.Serialize(response);

			await context.Response.WriteAsync(jsonResponse);
		}
	}
}
